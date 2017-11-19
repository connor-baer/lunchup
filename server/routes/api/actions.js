import express from 'express';
import logger from '../../util/logger';
import * as MESSAGE from '../../constants/messages';
import { sendResponse } from '../../services/interactions';
import * as LOCATIONS from '../../services/locations';
import * as USERS from '../../services/users';
import CONFIG from '../../../config';

const router = express.Router();

/* POST actions */
router.post('/', (req, res) => {
  const content = JSON.parse(req.body.payload);
  const { token, team, user, actions, response_url } = content;

  if (token !== CONFIG.slack.verificationToken) {
    res.status(401).end('Unauthorized');
    return;
  }

  const action = actions[0];

  if (!action) {
    res.status(422).end('No action specified');
  }

  // Best practice to respond with empty 200 status code.
  res.status(200).end();

  logger.info(`Action: ${action.name}`);

  switch (action.name) {
    case 'join': {
      if (action.value === 'true') {
        LOCATIONS.getLocations(team.id).then(locations => {
          const locationOptions = locations.map(location => ({
            text: decodeURI(location.city),
            value: location.city
          }));
          sendResponse(response_url, {
            response_type: 'ephermal',
            text:
              "🎉  Awesome! Lunch breaks are too short for ✈️, so I'll try to match you with colleagues near you.", // eslint-disable-line max-len
            replace_original: false,
            attachments: MESSAGE.location(locationOptions)
          });
        });
        break;
      }
      USERS.removeUser(team.id, user.id);
      sendResponse(response_url, {
        response_type: 'ephermal',
        text:
          '😔 Alright. Should you change your mind in the future, send me a message @lunchup.', // eslint-disable-line max-len
        replace_original: false
      });
      break;
    }
    case 'snooze': {
      if (action.value === 'false') {
        USERS.updateUser(team.id, user.id, { active: true, timestamp: false });
        sendResponse(response_url, {
          response_type: 'ephermal',
          text: "👍 Cool! I'll include you again.",
          replace_original: true
        });
        break;
      }
      const timestamp = new Date(
        +new Date() + 1000 * 60 * 60 * 24 * 7 * Number(action.value)
      );
      const singOrPlur = Number(action.value) > 1 ? 'weeks' : 'week';
      USERS.updateUser(team.id, user.id, { active: false, timestamp });
      sendResponse(response_url, {
        response_type: 'ephermal',
        text: `🗓 Alright! I'll include you again in ${action.value} ${
          singOrPlur
        }.`, // eslint-disable-line max-len
        replace_original: true
      });
      break;
    }
    case 'leave': {
      if (action.value === 'false') {
        sendResponse(response_url, {
          response_type: 'ephermal',
          text: "😌 No worries, you're still on board.",
          replace_original: true
        });
        break;
      }
      USERS.removeUser(team.id, user.id);
      sendResponse(response_url, {
        response_type: 'ephermal',
        text: "😢 Noooooo! Fine, I've removed you from the list.",
        replace_original: true
      });
      break;
    }
    case 'location': {
      const location = action.selected_options[0].value;
      const userWithLocation = Object.assign(user, { location });
      USERS.addUser(team.id, userWithLocation);
      sendResponse(response_url, {
        response_type: 'ephermal',
        text: `🗺 ${location}, nice! I've updated your location.`,
        replace_original: true
      });
      break;
    }
    default: {
      sendResponse(response_url, {
        response_type: 'ephermal',
        text: "🚨 This action hasn't been configured yet",
        replace_original: false
      });
    }
  }
});

export { router as actions };
