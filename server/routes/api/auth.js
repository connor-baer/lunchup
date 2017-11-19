import express from 'express';
import request from 'request';
import async from 'async';
import logger from '../../util/logger';
import * as TEAMS from '../../services/teams';
import * as SLACK from '../../services/slack';
import CONFIG from '../../../config';

const router = express.Router();

/* GET authentication */
router.get('/', (req, res) => {
  const { code, error } = req.query;

  if (!code) {
    logger.error('No code provided.', error);

    res.render('api/auth', {
      title: '🚨 Failure',
      message: error || 'No auth code given. Try again?'
    });
    return;
  }

  async.auto(
    {
      auth: callback => {
        // Post code, app ID, and app secret, to get token.
        let authAddress = 'https://slack.com/api/oauth.access?';
        authAddress += `client_id=${CONFIG.slack.clientId}`;
        authAddress += `&client_secret=${CONFIG.slack.clientSecret}`;
        authAddress += `&code=${code}`;
        authAddress += `&redirect_uri=${CONFIG.slack.redirectUrl}`;

        request.get(authAddress, (err, response, body) => {
          if (err) {
            logger.error('Error in auth.');
            return callback(err);
          }

          let auth;

          try {
            auth = JSON.parse(body);
          } catch (e) {
            logger.error('Could not parse auth.');
            return callback(new Error('Could not parse auth.'));
          }

          if (!auth.ok) {
            logger.error('Error in auth.', auth.error);
            return callback(new Error(auth.error));
          }

          return callback(null, auth);
        });
      },
      identity: [
        'auth',
        (results, callback) => {
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
              logger.error('Failed to parse body', e);
              return callback(e);
            }
          });
        }
      ],
      team: [
        'identity',
        (results, callback) => {
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

          TEAMS.addTeam(team.id, team)
            .then(() => {
              SLACK.initSlack(team.id);
              return callback(null, team);
            })
            .catch(err => {
              logger.error('Failed to initialise Slack', err);
              return callback(err);
            });
        }
      ]
    },
    err => {
      if (err) {
        logger.error('Failed to authenticate with Slack', err);
        res.render('api/auth', {
          title: '🚨 Failure',
          message: err || 'Something went wrong. Please try again.'
        });
        return;
      }

      res.render('api/auth', {
        title: '🚀 Success!',
        message: 'You can now invite the bot to your channels and use it!'
      });
    }
  );
});

export { router as auth };
