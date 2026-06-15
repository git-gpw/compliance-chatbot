const required = [
  'APP_PASSWORD',
  'GCP_PROJECT_ID',
  'GCP_LOCATION',
  'DIALOGFLOW_AGENT_ID',
];

const path = require('path');

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3001,
  appPassword: process.env.APP_PASSWORD,
  gcpProjectId: process.env.GCP_PROJECT_ID,
  gcpLocation: process.env.GCP_LOCATION,
  dialogflowAgentId: process.env.DIALOGFLOW_AGENT_ID,
  dataDir: process.env.DATA_DIR || path.join(__dirname, '../../data/sessions'),
};
