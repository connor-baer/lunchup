
const winston = require('winston');
winston.add(winston.transports.File, { filename: 'node.log' });

const ejs = require('ejs');
const async = require('async');
const express = require('express');
const request = require('request');
const app = express();

const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const storage = require('./utils/storage');

const config = require('./storage/config.json').config;
const {
  SLACK_APP_NAME,
  SLACK_CLIENT_ID,
  SLACK_CLIENT_SECRET,
  SLACK_VERIFICATION_TOKEN,
  SLACK_OAUTH_SCOPE,
  SLACK_REDIRECT,
  SLACK_BOT_TOKEN
} = config;


app.get('/', (req, res) => {
  winston.info('Requested /');

  const indexTemplate = __dirname + '/pages/index.ejs';
  const indexHtml = ejs.renderFile(indexTemplate, config, {}, (error, html) => html || error);

  res.send(indexHtml);
});


app.get('/api/auth', (req, res) => {
  const path = '/api/auth';
  winston.info('Requested ' + path);

  const { code, error } = req.query;
  winston.info(code);
  const authTemplate = __dirname + '/pages/api/auth.ejs';

  if (!code) {
    winston.info(path + ' No code provided.');

    const authHtml = ejs.renderFile(authTemplate, {
      message: 'Failure',
      content: error || 'No auth code given. Try again?'
    }, {}, (error, html) => html || error);

    res.send(authHtml);
  }

  async.auto(
    {
      auth: (callback) => {
        // Post code, app ID, and app secret, to get token.
        let authAddress = 'https://slack.com/api/oauth.access?'
        authAddress += 'client_id=' + SLACK_CLIENT_ID
        authAddress += '&client_secret=' + SLACK_CLIENT_SECRET
        authAddress += '&code=' + code
        authAddress += '&redirect_uri=' + SLACK_REDIRECT;

        request.get(authAddress, function (error, response, body) {

          if (error) {
            winston.log('error', path + ' Error in auth.');
            return callback(error);
          }

          let auth;

          try {
            auth = JSON.parse(body);
          } catch(e) {
            winston.log('error', path + ' Could not parse auth.');
            return callback(new Error('Could not parse auth.'));
          }

          if (!auth.ok) {
            winston.log('error', path + ' ' + auth.error);
            return callback(new Error(auth.error));
          }

          winston.info(path + ' ' + auth);
          callback(null, auth);

        });
      },
      identity: ['auth', (results, callback) => {

        let auth = (results || {}).auth || {};
        let url = 'https://slack.com/api/auth.test?'
        url += 'token=' + auth.access_token

        request.get(url, (error, response, body) => {

          if (error) {
            return callback(error);
          }

          let identity;

          try {
            identity = JSON.parse(body);

            winston.info(path + ' ' + identity);
            return callback(null, identity);
          } catch(e) {
            return callback(e);
          }

        });

      }],
      team: ['identity', (results, callback) => {

        let auth = (results || {}).auth || {};
        let identity = (results || {}).identity || {};
        let scopes = auth.scope.split(/\,/);

        let team = {
          id: identity.team_id,
          identity: identity,
          bot: auth.bot,
          auth: auth,
          createdBy: identity.user_id,
          url: identity.url,
          name: identity.team,
          access_token: auth.access_token
        }

        storage
          .addItem(team.id, team)
          .then(status => {
            winston.info(status);
            return callback(null, team);
          })
          .catch(error => {
            return callback(error);
          });
      }]
    },
    (err, results) => {
      if (err) {
        const authHtml = ejs.renderFile(authTemplate, {
          message: 'Failure',
          content: err && err.message
        }, {}, (error, html) => html || error);
        res.send(authHtml);
      }

      const authHtml = ejs.renderFile(authTemplate, {
        message: 'Success!',
        content: 'You can now invite the bot to your channels and use it!'
      }, {}, (error, html) => html || error);
      res.send(authHtml);
    }
  );
});


app.listen(8080, () => {
  winston.info('Listening on port 8080...');
});
