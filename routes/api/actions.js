const express = require('express');
const logger = require('../../lib/logger');
const { sendResponse } = require('../../lib/interactions');
const {
  addUser,
  updateUser,
  removeUser,
  getLocations
} = require('../../lib/db');
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
        getLocations(team.id).then(locations => {
          const locationOptions = locations.map(location => {
            return { text: decodeURI(location.city), value: location.city };
          });
          sendResponse(response_url, {
            response_type: 'ephermal',
            text:
              "🎉  Awesome! Lunch breaks are too short for ✈️, so I'll try to match you with colleagues near you.",
            replace_original: false,
            attachments: [
              {
                text: 'Where do you work?',
                fallback: 'You are currently unable to pick a location',
                color: '#3388ff',
                attachment_type: 'default',
                callback_id: 'location',
                actions: [
                  {
                    name: 'location',
                    text: 'Choose a city...',
                    type: 'select',
                    options: locationOptions
                  }
                ]
              }
            ]
          });
        });
        break;
      }
      removeUser(team.id, user.id);
      sendResponse(response_url, {
        response_type: 'ephermal',
        text: `😔 Alright. Should you change your mind in the future, send me a message @lunchup.`,
        replace_original: false
      });
      break;
    case 'location':
      const location = action.selected_options[0].value;
      const userWithLocation = Object.assign(user, { location });
      addUser(team.id, userWithLocation);
      sendResponse(response_url, {
        response_type: 'ephermal',
        text: `🗺 ${location}, nice! I've updated your location.`,
        replace_original: false
      });
      break;
    case 'snooze':
      if (action.value === 'false') {
        updateUser(team.id, user.id, { active: true, timestamp: false });
        message = {
          response_type: 'in_channel',
          text: `👍 Cool! I'll include you again.`,
          replace_original: true
        };
        break;
      }
      const timestamp = new Date(
        +new Date() + 1000 * 60 * 60 * 24 * 7 * Number(action.value)
      );
      const singOrPlur = Number(action.value) > 1 ? 'weeks' : 'week';
      updateUser(team.id, user.id, { active: false, timestamp });
      sendResponse(response_url, {
        response_type: 'ephermal',
        text: `🗓 Alright! I'll include you again in ${action.value} ${singOrPlur}.`,
        replace_original: true
      });
      break;
    default:
      sendResponse(response_url, {
        response_type: 'ephermal',
        text: `🚨 This action hasn't been configured yet`,
        replace_original: false
      });
  }
});

module.exports = router;
