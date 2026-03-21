const express = require('express');
const router = express.Router();

// @route   GET api/github/repos/:handle
// @desc    Fetch 3 most recently updated public repos securely
// @access  Public (Safe to be public because token is hidden on server)
router.get('/repos/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    
    // Fetch from GitHub using your high-limit PAT
    const response = await fetch(`https://api.github.com/users/${handle}/repos?sort=updated&per_page=3`, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ msg: 'Failed to fetch repos from GitHub API' });
    }

    const repos = await response.json();
    res.json(repos);
  } catch (err) {
    console.error("GitHub Backend Fetch Error:", err);
    res.status(500).send('Server Error fetching repos');
  }
});

module.exports = router;