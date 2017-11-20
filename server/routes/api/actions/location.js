import { get } from 'lodash';
import logger from '../../../util/logger';
import { sendResponse } from '../../../services/interactions';
import * as USERS from '../../../services/users';

export async function handleLocation(teamId, responseUrl, action, user) {
  try {
    console.log(action.selected_options);
    const location = get(action, 'selected_options[0].value');
    await USERS.updateUser(teamId, { ...user, location });
    return sendResponse(responseUrl, {
      response_type: 'ephermal',
      text: `🗺 ${location}, nice! I've updated your location.`,
      replace_original: true
    });
  } catch (e) {
    logger.error(`Failed to update a user's location`, e);
    return sendResponse(responseUrl, {
      response_type: 'ephermal',
      text: `⚠️ Failed to update your location.`
    });
  }
}
