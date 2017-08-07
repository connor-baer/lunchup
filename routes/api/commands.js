const logger = require('../../lib/logger');
const express = require('express');
const { sendResponse } = require('../../lib/interactions');
const { getUsers, updateUser } = require('../../lib/db');
const { stopBot, restartBot, apiForTeam } = require('../../lib/slack');
const { matchUsers, notifyUsers } = require('../../lib/match');
const config = require('../../config.json').config;

const { SLACK_VERIFICATION_TOKEN } = config;

const router = express.Router();

/* POST commands */
router.post('/', (req, res) => {
  const { response_url, command, text, token, team_id } = req.body;

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
  res.status(200).end('Working on it...');

  logger.info(`Command: ${command} ${text}`);

  const api = apiForTeam(team_id);

  const name = command.substr(1);

  if (name === 'lunchup') {
    switch (text) {
      case 'stop':
        stopBot(teamId);
        break;
      case 'restart':
        restartBot(teamId);
        break;
      case 'users':
        getUsers(team_id)
          .then(users => {
            const numberOfUsers = users.length;
            const userNames = users.map(user => user.name).join(', ');
            sendResponse(response_url, {
              response_type: 'ephermal',
              text: `There are ${numberOfUsers} users: ${userNames}.`
            });
          })
          .catch(err => logger.error(err));
        break;
      case 'match':
        getUsers(team_id)
          .then(users => {
            const today = new Date();
            users.map(user => {
              if (
                user.timestamp !== false &&
                new Date(user.timestamp).getTime() < today.getTime()
              ) {
                updateUser(team_id, user.id, {
                  active: true,
                  timestamp: false
                });
                user.active = true;
                return user;
              }
            });
            return users.filter(user => user.active);
          })
          .then(users => matchUsers(team_id, activeUsers))
          .then(matches => {
            matches.map(match => notifyUsers(team_id, match.users));
          })
          .catch(err => logger.error(err));
        break;
      default:
        sendResponse(response_url, {
          response_type: 'in_channel',
          text: "This command hasn't been configured."
        });
    }
  }
});

module.exports = router;
