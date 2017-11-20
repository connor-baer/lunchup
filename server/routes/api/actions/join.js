import logger from '../../../util/logger';
import { sendResponse } from '../../../services/interactions';
import * as LOCATIONS from '../../../services/locations';
import * as MESSAGE from '../../../constants/messages';
import * as USERS from '../../../services/users';

export async function handleJoin(teamId, responseUrl, action, user) {
  if (action.value === 'true') {
    try {
      await USERS.addUser(teamId, user);
      const locations = await LOCATIONS.getLocations(teamId);
      const locationOptions = locations.map(location => ({
        text: location.name,
        value: location.id
      }));
      return sendResponse(responseUrl, {
        response_type: 'ephermal',
        text:
          "🎉  Awesome! Lunch breaks are too short for ✈️, so I'll try to match you with colleagues near you.", // eslint-disable-line max-len
        replace_original: false,
        attachments: MESSAGE.location(locationOptions)
      });
    } catch (e) {
      logger.error(`Failed to add a user`, e);
      return sendResponse(responseUrl, {
        response_type: 'ephermal',
        text: `⚠️ Failed to add you.`
      });
    }
  }

  try {
    await USERS.removeUser(teamId, user.id);
    return sendResponse(responseUrl, {
      response_type: 'ephermal',
      text:
        '😔 Alright. Should you change your mind in the future, send me a message @lunchup.', // eslint-disable-line max-len
      replace_original: false
    });
  } catch (e) {
    logger.error(`Failed to remove a user`, e);
    return sendResponse(responseUrl, {
      response_type: 'ephermal',
      text: `⚠️ Failed to remove you.`
    });
  }
}
