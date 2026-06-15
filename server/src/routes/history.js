const { Router } = require('express');
const store = require('../storage/store');
const router = Router();

// GET /api/history — list all sessions
router.get('/', (_req, res) => {
  try {
    const sessions = store.getAllSessions();
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/history/:sessionId — get full session
router.get('/:sessionId', (req, res) => {
  try {
    const session = store.getSession(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
