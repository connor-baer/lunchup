const logger = require('../../lib/logger');
const express = require('express');
const { sendResponse } = require('../../lib/interactions');
const { getUsers } = require('../../lib/db');
const { matchUsers } = require('../../lib/lunchup');
const config = require('../../config.json').config;

const { SLACK_VERIFICATION_TOKEN } = config;

const router = express.Router();

/* POST commands */
router.post('/', (req, res) => {
  const { response_url, command, token, team_id } = req.body;

  if (token !== SLACK_VERIFICATION_TOKEN) {
    res.status(401).end('Unauthorized');
    return;
  }

  if (!command) {
    res.status(422).end('No command specified');
  }

  if (command[0] !== '/') {
    res.status(422).end('Commands must start with /');
  }

  // Best practice to respond with empty 200 status code.
  res.status(200).end();

  const name = command.substr(1);

  logger.info(`Command: ${name}`);

  let message = {};

  switch (name) {
    case 'lunchup':
      message = {
        response_type: 'in_channel',
        attachments: [
          {
            text:
              'Would you like to be paired up for lunch with a random coworker every week?',
            fallback: 'You are unable to participate.',
            callback_id: 'wopr_game',
            color: '#3388ff',
            attachment_type: 'default',
            actions: [
              {
                name: 'optin',
                text: 'Yes please!',
                style: 'primary',
                type: 'button',
                value: 'true'
              },
              {
                name: 'optout',
                text: 'No thanks.',
                style: 'danger',
                type: 'button',
                value: 'false'
              },
              {
                name: 'later',
                text: 'Maybe later.',
                type: 'button',
                value: 'later'
              }
            ]
          }
        ]
      };
      sendResponse(response_url, message);
      break;
    case 'lunchup':
      message = {
        response_type: 'in_channel',
        text: 'Matching the participants...'
      };
      getUsers(team_id)
        .then(users => matchUsers(team_id, users))
        .then(matches => logger.info(matches))
        .catch(err => logger.error(err));
      break;
    default:
      message = {
        response_type: 'in_channel',
        text: "This command hasn't been configured yet"
      };
      sendResponse(response_url, message);
  }
});

module.exports = router;
