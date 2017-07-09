
const winston = require('winston');
winston.add(winston.transports.File, { filename: 'node.log' });

const ejs = require('ejs');
const express = require('express');
const request = require('request');
const app = express();

const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const storage = require('./utils/storage');

const config = require('./config.json');
const {
  SLACK_APP_NAME,
  SLACK_CLIENT_ID,
  SLACK_CLIENT_SECRET,
  SLACK_VERIFICATION_TOKEN,
  SLACK_OAUTH_SCOPE,
  SLACK_REDIRECT,
  SLACK_BOT_TOKEN
} = config;


app.get('/auth', (req, res) => {
  winston.info('Requested /auth');

  const authTemplate = __dirname + '/pages/auth.ejs';
  const authHtml = ejs.renderFile(authTemplate, config, {}, (error, html) => html || error);

  res.send(authHtml);
});


app.get('/success', (req, res) => {
  winston.info('Requested /success');
  winston.info(req);

  const { code, error } = req.body;
  const successTemplate = __dirname + '/pages/success.ejs';

  if (!code) {
    const successHtml = ejs.renderFile(successTemplate, {
      message: 'Failure',
      content: error || 'No auth code given. Try again?'
    }, {}, (error, html) => html || error);

    res.send(successHtml);
  }
});


app.listen(8080, () => {
  winston.info('Listening on port 8080...');
});
