const { Router } = require('express');
const multer = require('multer');
const dialogflow = require('../services/dialogflow');
const { extractText } = require('../services/fileExtract');
const store = require('../storage/store');

const router = Router();

// Memory storage — files never written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
});

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    // Support both JSON body and multipart form fields
    const message   = req.body.message;
    const sessionId = req.body.sessionId;

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'message and sessionId are required' });
    }

    // ── File handling ──────────────────────────────────────────────
    let fileContext = null;
    let fileName    = null;
    let isImage     = false;

    if (req.file) {
      fileName = req.file.originalname;
      const mime = req.file.mimetype;
      isImage = mime.startsWith('image/');

      if (!isImage) {
        const { text, truncated } = await extractText(req.file.buffer, mime, fileName);
        if (text) {
          fileContext = text;
          if (truncated) {
            fileContext += '\n\n[Note: document was truncated to fit context limits.]';
          }
        }
      }
    }

    // ── Build the message sent to Dialogflow ───────────────────────
    let fullMessage = message;
    if (fileContext) {
      fullMessage =
        `[Uploaded document: ${fileName}]\n` +
        `---\n${fileContext}\n---\n` +
        `User question: ${message}`;
    } else if (isImage) {
      fullMessage = `[User uploaded an image: ${fileName}]\n${message}`;
    }

    // Save user message
    store.saveMessage(sessionId, 'user', message, { fileName: fileName || null });

    const response = await dialogflow.detectIntent(sessionId, fullMessage);
    const queryResult = response.queryResult || {};
    const responseMessages = queryResult.responseMessages || [];
    const texts = responseMessages
      .filter((m) => m.text)
      .map((m) => m.text.text.join('\n'));

    // Extract intent info and confidence
    const intentName = queryResult.match?.intent?.displayName || null;
    const confidence = typeof queryResult.match?.confidence === 'number'
      ? queryResult.match.confidence
      : null;

    // ── Agentic RAG: extract sources from Data Store connection signals ──
    const signals = queryResult.dataStoreConnectionSignals || {};
    const searchSnippets = signals.searchSnippets || [];

    if (searchSnippets.length === 0) {
      console.log('[RAG] No searchSnippets found. Raw signals keys:', Object.keys(signals));
      console.log('[RAG] Full queryResult keys:', Object.keys(queryResult));
    }

    const rawSources = searchSnippets.map((s) => ({
      title:   s.documentTitle   || s.document_title   || null,
      uri:     s.documentUri     || s.document_uri     || null,
      snippet: s.text || null,
    }));

    const uniqueSources = rawSources.filter(
      (s, i, arr) => arr.findIndex((x) => x.uri === s.uri) === i
    );

    const replyText = texts.join('\n\n') || 'No response from agent.';

    // Save bot message with metadata
    store.saveMessage(sessionId, 'bot', replyText, {
      intentName,
      confidence,
      sourceCount: uniqueSources.length,
    });

    res.json({
      reply: replyText,
      intentName,
      confidence,
      sources: uniqueSources,
      sourceCount: uniqueSources.length,
      raw: queryResult,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
