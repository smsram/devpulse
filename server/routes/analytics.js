const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Settings = require('../models/Settings');
const User = require('../models/User');

// @route   GET api/analytics/github
// @desc    Fetch and process GitHub data using GraphQL
// @access  Private
router.get('/github', auth, async (req, res) => {
  try {
    // 1. Get user's GitHub Handle from DB
    const user = await User.findById(req.user.id);
    const settings = await Settings.findOne({ user: req.user.id });
    const githubHandle = settings?.githubHandle || user?.username;

    if (!githubHandle) {
      return res.status(400).json({ msg: 'No GitHub handle linked.' });
    }

    // 2. The GraphQL Query (Gets Repos, Languages, and 1-Year Contribution Calendar in ONE request)
    const query = `
      query($userName: String!) {
        user(login: $userName) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
          repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: CREATED_AT, direction: ASC}) {
            nodes {
              name
              createdAt
              primaryLanguage {
                name
              }
            }
          }
        }
      }
    `;

    // 3. Fetch from GitHub GraphQL API
    const githubRes = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${process.env.GITHUB_PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { userName: githubHandle } })
    });

    const githubData = await githubRes.json();

    if (githubData.errors) {
      console.error(githubData.errors);
      return res.status(404).json({ msg: 'GitHub user not found or token invalid.' });
    }

    const { contributionsCollection, repositories } = githubData.data.user;

    // --- PROCESS PROFICIENCY (Top Languages) ---
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
      .sort((a, b) => parseInt(b.level) - parseInt(a.level)); // Sort highest to lowest

    // --- PROCESS SKILL ACQUISITION (Timeline) ---
    const seenLanguages = new Set();
    const timeline = [];
    
    repositories.nodes.forEach(repo => {
      if (repo.primaryLanguage && !seenLanguages.has(repo.primaryLanguage.name)) {
        seenLanguages.add(repo.primaryLanguage.name);
        timeline.push({
          date: new Date(repo.createdAt).toISOString().slice(0, 7), // YYYY-MM
          totalSkills: seenLanguages.size
        });
      }
    });

    // --- PROCESS HEATMAP (Last 35 Days for the UI Grid) ---
    const allDays = [];
    contributionsCollection.contributionCalendar.weeks.forEach(week => {
      week.contributionDays.forEach(day => allDays.push(day));
    });
    
    // Grab the last 35 days to fit our frontend grid exactly
    const recentDays = allDays.slice(-35).map(day => {
      let level = 0;
      if (day.contributionCount > 0 && day.contributionCount <= 3) level = 1;
      else if (day.contributionCount > 3 && day.contributionCount <= 6) level = 2;
      else if (day.contributionCount > 6) level = 3;
      return level;
    });

    // 4. Send the beautifully processed data back to React
    res.json({
      totalSkills: seenLanguages.size,
      totalCommits: contributionsCollection.contributionCalendar.totalContributions,
      proficiency,
      timeline,
      heatmap: recentDays
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error fetching Analytics');
  }
});

module.exports = router;