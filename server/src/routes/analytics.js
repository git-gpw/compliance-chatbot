const { Router } = require('express');
const store = require('../storage/store');
const router = Router();

// GET /api/analytics — aggregated metrics
router.get('/', (_req, res) => {
  try {
    const analytics = store.getAnalytics();
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
