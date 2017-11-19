import logger from '../../../util/logger';
import { sendResponse } from '../../../services/interactions';
import * as GROUPS from '../../../services/groups';
import * as USERS from '../../../services/users';

export async function handleMatch(teamId, responseUrl) {
  try {
    const users = await USERS.getUsers(teamId);
    const activeUsers = await GROUPS.updateUsers(teamId, users);
    const groupedUsers = await GROUPS.groupUsers(teamId, activeUsers);
    const matching = groupedUsers.map(group =>
      GROUPS.matchUsers(teamId, group.users).then(matches =>
        matches.map(match => GROUPS.notifyUsers(teamId, match.users))
      )
    );
    return Promise.all(matching);
  } catch (e) {
    logger.error('Failed to respond to match command', e);
    return sendResponse(responseUrl, {
      response_type: 'ephermal',
      text: e
    });
  }
}
