import logger from '../../../util/logger';
import { sendResponse } from '../../../services/interactions';
import * as USERS from '../../../services/users';

export async function handleSnooze(teamId, responseUrl, action, user) {
  if (action.value === 'false') {
    try {
      await USERS.updateUser(teamId, {
        id: user.id,
        active: true,
        timestamp: false
      });
      return sendResponse(responseUrl, {
        response_type: 'ephermal',
        text: "👍 Cool! I'll include you again.",
        replace_original: true
      });
    } catch (e) {
      logger.error(`Failed to include a user again`, e);
      return sendResponse(responseUrl, {
        response_type: 'ephermal',
        text: `⚠️ Failed to include you again.`
      });
    }
  }

  try {
    const timestamp = new Date(
      +new Date() + 1000 * 60 * 60 * 24 * 7 * Number(action.value)
    );
    const singOrPlur = Number(action.value) > 1 ? 'weeks' : 'week';
    await USERS.updateUser(teamId, {
      id: user.id,
      active: false,
      snooze: true,
      timestamp
    });
    return sendResponse(responseUrl, {
      response_type: 'ephermal',
      text: `🗓 Alright! I'll include you again in ${action.value} ${
        singOrPlur
      }.`, // eslint-disable-line max-len
      replace_original: true
    });
  } catch (e) {
    logger.error(`Failed to snooze a user`, e);
    return sendResponse(responseUrl, {
      response_type: 'ephermal',
      text: `⚠️ Failed to snooze you.`
    });
  }
}
