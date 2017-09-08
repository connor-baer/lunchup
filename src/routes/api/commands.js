const logger = require('../../lib/logger');
const express = require('express');
const { sendResponse } = require('../../lib/interactions');
const {
  getUsers,
  addLocation,
  removeLocation,
  getLocations
} = require('../../lib/db');
const { stopBot, restartBot } = require('../../lib/slack');
const {
  updateUsers,
  groupUsers,
  matchUsers,
  notifyUsers
} = require('../../lib/match');
const config = require('../../../config.json').config;

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

  const words = text.split(' ');
  const action = words[1];

  if (command === '/lunchup') {
    switch (words[0]) {
      case 'users':
        getUsers(team_id)
          .then(users => {
            const numberOfUsers = users.length;
            const userNames = users.map(user => user.name).join(', ');
            sendResponse(response_url, {
              response_type: 'ephermal',
              text: `ℹ️ There are ${numberOfUsers} users: ${userNames}.`
            });
          })
          .catch(err => {
            logger.error(err);
            sendResponse(response_url, {
              response_type: 'ephermal',
              text: err
            });
          });
        break;
      case 'match': {
        getUsers(team_id)
          .then(users => updateUsers(team_id, users))
          .then(activeUsers => groupUsers(team_id, activeUsers))
          .then(groupedUsers => {
            const matching = groupedUsers.map(group =>
              matchUsers(team_id, group.users).then(matches =>
                matches.map(match => notifyUsers(team_id, match.users))
              )
            );
            return Promise.all(matching);
          })
          .catch(err => {
            logger.error(err);
            sendResponse(response_url, {
              response_type: 'ephermal',
              text: err
            });
          });
        break;
      }
      case 'locations': {
        const location = words[2];
        if (!action) {
          break;
        }
        switch (action) {
          case 'add':
            addLocation(team_id, location);
            sendResponse(response_url, {
              response_type: 'ephermal',
              text: `✅ Added ${location} to the available locations.`
            });
            break;
          case 'remove':
            removeLocation(team_id, location);
            sendResponse(response_url, {
              response_type: 'ephermal',
              text: `✅ Removed ${location} from the available locations.`
            });
            break;
          case 'list':
            getLocations(team_id, location)
              .then(locations => {
                const numberOfLocations = locations.length;
                const locationNames = locations
                  .map(item => item.city)
                  .join(', ');
                sendResponse(response_url, {
                  response_type: 'ephermal',
                  text: `ℹ️ There are ${numberOfLocations} locations: ${locationNames}.`
                });
              })
              .catch(err => {
                logger.error(err);
                sendResponse(response_url, {
                  response_type: 'ephermal',
                  text: err
                });
              });
            break;
          default:
            break;
        }
        break;
      }
      case 'bot': {
        if (!action) {
          break;
        }
        switch (words[1]) {
          case 'restart':
            restartBot(team_id);
            break;
          case 'stop':
            stopBot(team_id);
            break;
          default:
            break;
        }
        break;
      }
      default: {
        sendResponse(response_url, {
          response_type: 'in_channel',
          text: "🚫 This command hasn't been configured."
        });
      }
    }
  }
});

module.exports = router;
