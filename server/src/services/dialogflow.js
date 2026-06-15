const { SessionsClient } = require('@google-cloud/dialogflow-cx');
const config = require('../config');

let _client = null;

function getClient() {
  if (!_client) {
    _client = new SessionsClient({
      apiEndpoint: `${config.gcpLocation}-dialogflow.googleapis.com`,
    });
  }
  return _client;
}

async function detectIntent(sessionId, text, languageCode = 'en') {
  const client = getClient();
  const sessionPath = client.projectLocationAgentSessionPath(
    config.gcpProjectId,
    config.gcpLocation,
    config.dialogflowAgentId,
    sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: { text },
      languageCode,
    },
  };

  const [response] = await client.detectIntent(request);
  return response;
}

module.exports = { detectIntent };
