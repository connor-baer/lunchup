import { crypto } from 'crypto';
import { isEmpty } from 'lodash';
import logger from '../util/logger';
import * as SLACK from './slack';
import * as LOCATIONS from './locations';
import * as USERS from './users';
import DB from '../db';

export async function getGroups(teamId) {
  try {
    return await DB.groups.getGroups(teamId);
  } catch (e) {
    throw new Error(e);
  }
}

export async function addGroup(teamId, group) {
  if (!teamId) {
    throw new Error('Team id not provided.');
  }
  if (!group) {
    throw new Error('Group not provided.');
  }
  const newGroup = {
    _id: `${teamId}${group.id}`,
    team_id: teamId,
    ...group
  };
  try {
    return await DB.groups.updateGroup(newGroup);
  } catch (e) {
    throw new Error(e);
  }
}

export async function updateGroup(teamId, group) {
  if (!teamId) {
    throw new Error('Team id not provided.');
  }
  if (!group) {
    throw new Error('Group not provided.');
  }
  const _id = `${teamId}${group.id}`;
  const oldGroup = await DB.groups.getGroup(_id);
  const newGroup = { ...oldGroup, ...group };
  try {
    return await DB.groups.updateGroup(newGroup);
  } catch (e) {
    throw new Error(e);
  }
}

export async function removeGroup(teamId, groupId) {
  if (!teamId) {
    throw new Error('Team id not provided.');
  }
  if (!groupId) {
    throw new Error('Group name not provided.');
  }
  const _id = `${teamId}${groupId}`;
  try {
    return await DB.groups.removeGroup(_id);
  } catch (e) {
    throw new Error(e);
  }
}

export function updateUsers(teamId, users) {
  if (!teamId || isEmpty(users)) {
    return null;
  }

  const today = new Date();
  users.map(user => {
    if (
      user.timestamp !== false &&
      new Date(user.timestamp).getTime() < today.getTime()
    ) {
      USERS.updateUser(teamId, {
        id: user.id,
        active: true,
        timestamp: false
      });
      user.active = true;
      return user;
    }
    return user;
  });
  return users.filter(user => user.active);
}

export function groupUsers(teamId, users) {
  return LOCATIONS.getLocations(teamId).then(locations =>
    locations.map(location => ({
      location,
      users: users.filter(user => user.location === location)
    }))
  );
}

export function matchUsers(teamId, users) {
  return new Promise((resolve, reject) => {
    if (users.length < 2) {
      return reject('There are not enough users.');
    }

    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getYear();
    const timestamp = [day, month, year].join('.');
    let usersLeft = users;

    while (usersLeft.length > 2) {
      const person1 = usersLeft[0].id;
      const randomInt = Math.floor(Math.random() * (usersLeft.length - 1) + 1);
      const person2 = users[randomInt].id;
      const id = crypto
        .createHash('sha1')
        .update(person1 + person2)
        .digest('hex');

      const match = { timestamp, id, users: [person1, person2] };

      if (!DB.matches.getMatch(teamId, id)) {
        DB.matches.addMatch(teamId, match);
        usersLeft = usersLeft.filter(
          value => value.id !== person1 && value.id !== person2
        );
      }
    }
    return resolve(DB.matches.getMatches(teamId, timestamp));
  });
}

export function notifyUsers(teamId, userIds) {
  const users = userIds.join(',');
  const api = SLACK.apiForTeam(teamId);
  api.mpim.open(users, (err, res) => {
    if (err) {
      logger.error('Failed to notify users', err);
      return;
    }
    const channel = res.group.id;
    api.chat.postMessage(
      channel,
      'Hello there! This is your blind lunch partner for this week. Have a lovely time and enjoy your meal! 🍽' // eslint-disable-line max-len
    );
  });
}
