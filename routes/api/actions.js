const express = require('express');
const logger = require('../../lib/logger');
const { sendResponse } = require('../../lib/interactions');
const { addUser, snoozeUser, removeUser } = require('../../lib/db');
const { config } = require('../../config.json');

const { SLACK_VERIFICATION_TOKEN } = config;

const router = express.Router();

/* POST actions */
router.post('/', (req, res) => {
  const content = JSON.parse(req.body.payload);
  const { token, team, user, actions, response_url } = content;

  if (token !== SLACK_VERIFICATION_TOKEN) {
    res.status(401).end('Unauthorized');
    return;
  }

  const action = actions[0];

  if (!action) {
    res.status(422).end('No action specified');
  }

  // Best practice to respond with empty 200 status code.
  res.status(200).end();

  let message = {};

  logger.info(`Action: ${action.name}`);

  switch (action.name) {
    case 'join':
      if (action.value === 'true') {
        addUser(team.id, user);
        message = {
          response_type: 'ephermal',
          text: `🎉 Awesome! Happy to have you on board.`,
          replace_original: true
        };
      } else {
        removeUser(team.id, user);
        message = {
          response_type: 'ephermal',
          text: `😔 Alright. Should you change your mind in the future, send me a message @lunchup.`,
          replace_original: true
        };
      }
      break;
    case 'snooze':
      const timestamp = new Date(+new Date + (1000 * 60 * 60 * 24 * 7 * Number(action.value)));
      snoozeUser(team.id, user, timestamp);
      message = {
        response_type: 'ephermal',
        text: `🗓 Alright! I'll include you again in a week.`,
        replace_original: true
      };
      break;
    default:
      message = {
        response_type: 'ephermal',
        text: `🚨 This action hasn't been configured yet`,
        replace_original: false
      };
  }

  sendResponse(response_url, message);
});

module.exports = router;
