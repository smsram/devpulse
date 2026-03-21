const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Project = require('../models/Project');
const { createNotification } = require('./notifications');

// @route   GET api/public/user/:username
// @desc    Get aggregated public profile data (Profile, Projects, GitHub Stats)
// @access  Public
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // 1. Find User by Username
    // Assuming your User model has a 'username' field. If not, adjust accordingly.
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // 2. Fetch Settings and Check Privacy
    const settings = await Settings.findOne({ user: user._id });
    
    // Protect private profiles
    if (settings?.preferences?.portfolioIsPublic === false) {
      return res.status(403).json({ 
        msg: 'This profile is private.',
        settings: { preferences: { portfolioIsPublic: false } } // Allow frontend to know it's intentionally private
      });
    }

    // 3. Fetch Featured Projects
    const projects = await Project.find({ user: user._id }).sort({ orderIndex: 1 });

    // 4. Fetch GitHub Data (If a handle exists)
    const githubHandle = settings?.githubHandle || user.username;
    let githubData = null;
    let recentRepos = [];

    if (githubHandle && process.env.GITHUB_PAT) {
      try {
        // Run both GitHub API calls concurrently for speed
        const [graphqlRes, restRes] = await Promise.all([
          // GraphQL for deep analytics (Heatmap, Timeline, Proficiency)
          fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
              'Authorization': `bearer ${process.env.GITHUB_PAT}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `
                query($userName: String!) {
                  user(login: $userName) {
                    contributionsCollection {
                      contributionCalendar {
                        totalContributions
                        weeks { contributionDays { contributionCount date } }
                      }
                    }
                    repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: CREATED_AT, direction: ASC}) {
                      nodes { createdAt primaryLanguage { name } }
                    }
                  }
                }
              `,
              variables: { userName: githubHandle }
            })
          }),
          
          // REST API for recent activity feed
          fetch(`https://api.github.com/users/${githubHandle}/repos?sort=updated&per_page=3`, {
            headers: {
              'Authorization': `Bearer ${process.env.GITHUB_PAT}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          })
        ]);

        const ghGraphQL = await graphqlRes.json();
        
        if (restRes.ok) {
          recentRepos = await restRes.json();
        }

        // Process GraphQL Data if successful
        if (ghGraphQL.data && ghGraphQL.data.user) {
          const { contributionsCollection, repositories } = ghGraphQL.data.user;

          // Process Proficiency
          const langCounts = {};
          let totalReposWithLang = 0;
          repositories.nodes.forEach(repo => {
            if (repo.primaryLanguage) {
              const lang = repo.primaryLanguage.name;
              langCounts[lang] = (langCounts[lang] || 0) + 1;
              totalReposWithLang++;
            }
          });

          const proficiency = Object.keys(langCounts)
            .map(lang => ({
              name: lang,
              level: Math.round((langCounts[lang] / totalReposWithLang) * 100) + '%'
            }))
            .sort((a, b) => parseInt(b.level) - parseInt(a.level));

          // Process Timeline
          const seenLanguages = new Set();
          const timeline = [];
          repositories.nodes.forEach(repo => {
            if (repo.primaryLanguage && !seenLanguages.has(repo.primaryLanguage.name)) {
              seenLanguages.add(repo.primaryLanguage.name);
              timeline.push({
                date: new Date(repo.createdAt).toISOString().slice(0, 7),
                totalSkills: seenLanguages.size
              });
            }
          });

          // Process Heatmap (Last 35 Days)
          const allDays = [];
          contributionsCollection.contributionCalendar.weeks.forEach(week => {
            week.contributionDays.forEach(day => allDays.push(day));
          });
          
          const heatmap = allDays.slice(-35).map(day => {
            let level = 0;
            if (day.contributionCount > 0 && day.contributionCount <= 3) level = 1;
            else if (day.contributionCount > 3 && day.contributionCount <= 6) level = 2;
            else if (day.contributionCount > 6) level = 3;
            return level;
          });

          githubData = {
            totalSkills: seenLanguages.size,
            totalCommits: contributionsCollection.contributionCalendar.totalContributions,
            proficiency,
            timeline,
            heatmap
          };
        }
      } catch (ghError) {
        console.error("GitHub Fetch Error on Public Route:", ghError);
        // We don't fail the whole request if GitHub fails, we just pass githubData as null
      }
    }

    // 5. Send aggregated payload
    res.json({
      user: {
        name: user.name,
        username: user.username,
        email: user.email // Used for the "Connect" mailto button
      },
      settings,
      projects,
      githubData,
      recentRepos
    });

  } catch (err) {
    console.error("Public Route Error:", err.message);
    res.status(500).send('Server Error fetching public profile');
  }
});

// Add this inside server/routes/public.js

// @route   GET api/public/users
// @desc    Get directory of all public users
// @access  Public
router.get('/users', async (req, res) => {
  try {
    // Find settings where portfolio is NOT explicitly false
    const publicSettings = await Settings.find({
      'preferences.portfolioIsPublic': { $ne: false }
    }).populate('user', 'name username');

    // Format the response for the directory cards
    const directory = publicSettings
      .filter(setting => setting.user) // Ensure populated user exists
      .map(setting => ({
        id: setting.user._id,
        name: setting.user.name,
        username: setting.user.username,
        headline: setting.headline || 'Software Engineer',
        profilePicture: setting.profilePicture || '',
        skills: setting.skills || [],
      }));

    res.json(directory);
  } catch (err) {
    console.error("Directory Fetch Error:", err);
    res.status(500).send('Server Error fetching directory');
  }
});

// @route   POST api/public/support
// @desc    Submit ticket, notify user, and forward to Formspree
// @access  Public
router.post('/support', async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // 1. Forward to Formspree (Server-to-Server)
    // This keeps your Formspree URL hidden from the frontend
    try {
      await axios.post('https://formspree.io/f/mgonqbqo', {
        email,
        subject,
        message,
        _subject: `DevPulse Support: ${subject}` // Optional: customizes Formspree email subject
      });
    } catch (formError) {
      console.error("Formspree Forwarding Error:", formError.message);
      // We continue even if Formspree fails so the user still gets their internal notification
    }

    // 2. Internal Logic: Create Notification if user exists
    const user = await User.findOne({ email });
    if (user) {
      await createNotification(
        user._id,
        `Support ticket received: "${subject}". Our team is on it.`,
        'success'
      );
    }

    res.json({ msg: 'Ticket submitted successfully' });

  } catch (err) {
    console.error("Support Ticket Error:", err.message);
    res.status(500).send('Server Error processing ticket');
  }
});

module.exports = router;