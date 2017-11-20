import logger from '../../../util/logger';
import { sendResponse } from '../../../services/interactions';
import * as USERS from '../../../services/users';

export async function handleLeave(teamId, responseUrl, action, user) {
  if (action.value === 'true') {
    try {
      await USERS.removeUser(teamId, user.id);
      return sendResponse(responseUrl, {
        response_type: 'ephermal',
        text: "😢 Noooooo! Fine, I've removed you from the list.",
        replace_original: true
      });
    } catch (e) {
      logger.error(`Failed to remove a user`, e);
      return sendResponse(responseUrl, {
        response_type: 'ephermal',
        text: `⚠️ Failed to remove you.`
      });
    }
  }
  return sendResponse(responseUrl, {
    response_type: 'ephermal',
    text: "😌 No worries, you're still on board.",
    replace_original: true
  });
}
