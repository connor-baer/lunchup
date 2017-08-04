const winston = require('winston');
const express = require('express');
const request = require('request');
const async = require('async');
const { addTeam } = require('../../lib/db');
const { initSlack } = require('../../lib/slack');
const { config } = require('../../config.json');

const {
  SLACK_CLIENT_ID,
  SLACK_CLIENT_SECRET,
  SLACK_REDIRECT
} = config;

const router = express.Router();

/* GET authentication */
router.get('/', (req, res) => {
  const path = '/api/auth';
  winston.info(`Requested ${path}`);

  const { code, error } = req.query;

  if (!code) {
    winston.log('error', 'No code provided.');

    res.render('api/auth', {
      message: 'Failure',
      content: error || 'No auth code given. Try again?'
    });
  }

  async.auto(
    {
      auth: (callback) => {
        // Post code, app ID, and app secret, to get token.
        let authAddress = 'https://slack.com/api/oauth.access?';
        authAddress += `client_id=${SLACK_CLIENT_ID}`;
        authAddress += `&client_secret=${SLACK_CLIENT_SECRET}`;
        authAddress += `&code=${code}`;
        authAddress += `&redirect_uri=${SLACK_REDIRECT}`;

        request.get(authAddress, (err, response, body) => {

          if (err) {
            winston.log('error', 'Error in auth.');
            return callback(err);
          }

          let auth;

          try {
            auth = JSON.parse(body);
          } catch (e) {
            winston.log('error', 'Could not parse auth.');
            return callback(new Error('Could not parse auth.'));
          }

          if (!auth.ok) {
            winston.log('error', auth.error);
            return callback(new Error(auth.error));
          }

          return callback(null, auth);
        });
      },
      identity: ['auth', (results, callback) => {
        const auth = (results || {}).auth || {};
        let url = 'https://slack.com/api/auth.test?';
        url += `token=${auth.access_token}`;

        request.get(url, (err, response, body) => {
          if (err) {
            return callback(err);
          }

          let identity;

          try {
            identity = JSON.parse(body);

            return callback(null, identity);
          } catch (e) {
            return callback(e);
          }
        });
      }],
      team: ['identity', (results, callback) => {
        const auth = (results || {}).auth || {};
        const identity = (results || {}).identity || {};

        const team = {
          id: identity.team_id,
          identity,
          bot: auth.bot,
          auth,
          createdBy: identity.user_id,
          url: identity.url,
          name: identity.team,
          access_token: auth.access_token
        };

        addTeam(team.id, team);

        initSlack(team.bot.bot_access_token, team.access_token);

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

module.exports = router;
