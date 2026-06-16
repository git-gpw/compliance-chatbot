const required = [
  'APP_PASSWORD',
  'GCP_PROJECT_ID',
  'GCP_LOCATION',
  'DIALOGFLOW_AGENT_ID',
  'GOOGLE_APPLICATION_CREDENTIALS',
];

const fs = require('fs');
const path = require('path');
const serverRoot = path.resolve(__dirname, '..');

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}. Run "npm run setup" from the server directory.`
    );
  }
}

const googleCredentialsPath = path.resolve(serverRoot, process.env.GOOGLE_APPLICATION_CREDENTIALS);
if (!fs.existsSync(googleCredentialsPath)) {
  throw new Error(`GOOGLE_APPLICATION_CREDENTIALS file not found: ${googleCredentialsPath}`);
}

process.env.GOOGLE_APPLICATION_CREDENTIALS = googleCredentialsPath;

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3001,
  appPassword: process.env.APP_PASSWORD,
  gcpProjectId: process.env.GCP_PROJECT_ID,
  gcpLocation: process.env.GCP_LOCATION,
  dialogflowAgentId: process.env.DIALOGFLOW_AGENT_ID,
  googleCredentialsPath,
  dataDir: process.env.DATA_DIR
    ? path.resolve(serverRoot, process.env.DATA_DIR)
    : path.resolve(serverRoot, '../data/sessions'),
};
