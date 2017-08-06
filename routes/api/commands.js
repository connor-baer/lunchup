const logger = require('../../lib/logger');
const express = require('express');
const { sendResponse } = require('../../lib/interactions');
const { getUsers } = require('../../lib/db');
const { stopBot, restartBot } = require('../../lib/bots');
const { matchUsers } = require('../../lib/match');
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

  logger.info(`Command: ${command}`);

  const words = command.slice(' ');
  const name = words[0].substr(1);
  const argument = words[1];

  let message = {};

  if (name === 'lunchup') {
    switch (argument) {
      case 'stop':
        stopBot(teamId);
        break;
      case 'restart':
        restartBot(teamId);
        break;
      case 'match':
        message = {
          response_type: 'in_channel',
          text: 'Matching the participants...'
        };
        sendResponse(response_url, message);
        getUsers(team_id)
          .then(users => {
            const activeUsers = users.filter(user => user.active);
            return matchUsers(team_id, activeUsers);
          })
          .then(matches => logger.info(matches))
          .catch(err => logger.error(err));
        break;
      default:
        message = {
          response_type: 'in_channel',
          text: "This command hasn't been configured."
        };
        sendResponse(response_url, message);
    }
  }
});

module.exports = router;
