import { crypto } from 'crypto';
import logger from './logger';
import { apiForTeam } from './slack';
import { updateUser, getLocations, hasMatch, addMatch, getMatches } from './db';

export function updateUsers(teamId, users) {
  const today = new Date();
  users.map(user => {
    if (
      user.timestamp !== false &&
      new Date(user.timestamp).getTime() < today.getTime()
    ) {
      updateUser(teamId, user.id, {
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
  return getLocations(teamId).then(locations =>
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

      if (!hasMatch(teamId, id)) {
        addMatch(teamId, match);
        usersLeft = usersLeft.filter(
          value => value.id !== person1 && value.id !== person2
        );
      }
    }
    return resolve(getMatches(teamId, timestamp));
  });
}

export function notifyUsers(teamId, userIds) {
  const users = userIds.join(',');
  const api = apiForTeam(teamId);
  api.mpim.open(users, (err, res) => {
    if (err) {
      logger.error(err);
      return;
    }
    const channel = res.group.id;
    api.chat.postMessage(
      channel,
      'Hello there! This is your blind lunch partner for this week. Have a lovely time and enjoy your meal! 🍽'
    );
  });
}
