import logger from '../../../util/logger';
import { sendResponse } from '../../../services/interactions';
import * as USERS from '../../../services/users';

export async function handleUsers(teamId, responseUrl) {
  try {
    const users = await USERS.getUsers(teamId);
    const numberOfUsers = users.length;
    const userNames = users.map(user => user.name).join(', ');
    return sendResponse(responseUrl, {
      response_type: 'ephermal',
      text: `ℹ️ There are ${numberOfUsers} users: ${userNames}.`
    });
  } catch (e) {
    logger.error('Failed to respond to users command', e);
    return sendResponse(responseUrl, {
      response_type: 'ephermal',
      text: e
    });
  }
}
