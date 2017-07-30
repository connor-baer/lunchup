const winston = require('winston');
const express = require('express');
const request = require('request');
const async = require('async');
const db = require('../lib/db');
const lunchup = require('../lib/rtm');
const config = require('../config.json').config;
const {
  SLACK_CLIENT_ID,
  SLACK_CLIENT_SECRET,
  SLACK_VERIFICATION_TOKEN,
  SLACK_OAUTH_SCOPE,
  SLACK_REDIRECT
} = config;

const router = express.Router();

/* GET authentication */
router.get('/auth', (req, res) => {
  const path = '/api/auth';
  winston.info('Requested ' + path);

  const { code, error } = req.query;

  if (!code) {
    winston.log('error', path + ' No code provided.');

    res.render('api/auth', {
      message: 'Failure',
      content: error || 'No auth code given. Try again?'
    });
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

        request.get(authAddress, (error, response, body) => {

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

        db.addTeam(team.id, team);

        lunchup(team.bot.bot_access_token);

        return callback(null, team);
      }]
    },
    (err, results) => {
      if (err) {
        res.render('api/auth', {
          message: 'Failure',
          content: err && err.message
        });
      }

      res.render('api/auth', {
        message: 'Success!',
        content: 'You can now invite the bot to your channels and use it!'
      });
    }
  );
});

router.get('/events', (req, res) => {
  const path = '/api/events';
  const { token, challenge } = req.body;
  winston.info(`Requested ${path}`);
  winston.info(`Challenge: ${challenge}`);

  if (token === SLACK_VERIFICATION_TOKEN) {
    res.json({ challenge });
    return;
  }
  res.status(401).send();
});

module.exports = router;
