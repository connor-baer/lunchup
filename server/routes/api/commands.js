import express from 'express';
import logger from '../../util/logger';
import { sendResponse } from '../../services/interactions';
import * as DB from '../../services/db';
import * as SLACK from '../../services/slack';
import * as MATCH from '../../services/match';
import { config } from '../../../config.json';

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
        DB.getUsers(team_id)
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
        DB.getUsers(team_id)
          .then(users => MATCH.updateUsers(team_id, users))
          .then(activeUsers => MATCH.groupUsers(team_id, activeUsers))
          .then(groupedUsers => {
            const matching = groupedUsers.map(group =>
              MATCH.matchUsers(team_id, group.users).then(matches =>
                matches.map(match => MATCH.notifyUsers(team_id, match.users))
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
            DB.addLocation(team_id, location);
            sendResponse(response_url, {
              response_type: 'ephermal',
              text: `✅ Added ${location} to the available locations.`
            });
            break;
          case 'remove':
            DB.removeLocation(team_id, location);
            sendResponse(response_url, {
              response_type: 'ephermal',
              text: `✅ Removed ${location} from the available locations.`
            });
            break;
          case 'list':
            DB.getLocations(team_id, location)
              .then(locations => {
                const numberOfLocations = locations.length;
                const locationNames = locations
                  .map(item => item.city)
                  .join(', ');
                sendResponse(response_url, {
                  response_type: 'ephermal',
                  text: `ℹ️ There are ${numberOfLocations} locations: ${locationNames}.` // eslint-disable-line max-len
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
            SLACK.restartBot(team_id);
            break;
          case 'stop':
            SLACK.stopBot(team_id);
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

export { router as commands };
