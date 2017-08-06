const logger = require('../../lib/logger');
const express = require('express');
const { sendResponse } = require('../../lib/interactions');
const { getUsers, updateUser } = require('../../lib/db');
const { stopBot, restartBot, apiForTeam } = require('../../lib/bots');
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
  res.status(200).send('Working on it...');

  logger.info(`Command: ${command}`);

  const api = apiForTeam(team_id);

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
        getUsers(team_id)
          .then(users => {
            const today = new Date();
            users.map(user => {
              if (
                user.timestamp !== false &&
                user.timestamp.getTime() < today.getTime()
              ) {
                updateUser(team_id, user.id, {
                  active: true,
                  timestamp: false
                });
              }
            });
            return users;
          })
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
