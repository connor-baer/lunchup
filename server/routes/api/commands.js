import express from 'express';
import logger from '../../util/logger';
import { sendResponse } from '../../services/interactions';
import * as SLACK from '../../services/slack';
import * as GROUPS from '../../services/groups';
import * as LOCATIONS from '../../services/locations';
import * as USERS from '../../services/users';
import CONFIG from '../../../config';

const router = express.Router();

/* POST commands */
router.post('/', (req, res) => {
  const { response_url, command, text, token, team_id } = req.body;

  if (token !== CONFIG.slack.verificationToken) {
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
        USERS.getUsers(team_id)
          .then(users => {
            const numberOfUsers = users.length;
            const userNames = users.map(user => user.name).join(', ');
            sendResponse(response_url, {
              response_type: 'ephermal',
              text: `ℹ️ There are ${numberOfUsers} users: ${userNames}.`
            });
          })
          .catch(err => {
            logger.error('Failed to respond to users command', err);
            sendResponse(response_url, {
              response_type: 'ephermal',
              text: err
            });
          });
        break;
      case 'match': {
        USERS.getUsers(team_id)
          .then(users => GROUPS.updateUsers(team_id, users))
          .then(activeUsers => GROUPS.groupUsers(team_id, activeUsers))
          .then(groupedUsers => {
            const matching = groupedUsers.map(group =>
              GROUPS.matchUsers(team_id, group.users).then(matches =>
                matches.map(match => GROUPS.notifyUsers(team_id, match.users))
              )
            );
            return Promise.all(matching);
          })
          .catch(err => {
            logger.error('Failed to respond to match command', err);
            sendResponse(response_url, {
              response_type: 'ephermal',
              text: err
            });
          });
        break;
      }
      case 'locations': {
        const location = words.slice(2);
        if (!action) {
          break;
        }
        switch (action) {
          case 'add':
            LOCATIONS.addLocation(team_id, location);
            sendResponse(response_url, {
              response_type: 'ephermal',
              text: `✅ Added ${location} to the available locations.`
            });
            break;
          case 'remove':
            LOCATIONS.removeLocation(team_id, location);
            sendResponse(response_url, {
              response_type: 'ephermal',
              text: `✅ Removed ${location} from the available locations.`
            });
            break;
          case 'list':
            LOCATIONS.getLocations(team_id, location)
              .then(locations => {
                const numberOfLocations = locations.length;
                const locationNames = locations
                  .map(item => item.name)
                  .join(', ');
                sendResponse(response_url, {
                  response_type: 'ephermal',
                  text: `ℹ️ There are ${numberOfLocations} locations: ${
                    locationNames
                  }.` // eslint-disable-line max-len
                });
              })
              .catch(err => {
                logger.error('Failed to respond to locations command', err);
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
