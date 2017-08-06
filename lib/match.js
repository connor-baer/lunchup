const crypto = require('crypto');
const { apiForTeam } = require('./slack');
const { hasMatch, addMatch, getMatches } = require('./db');

function notifyUsers(teamId, userIds) {
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

function matchUsers(teamId, users) {
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

module.exports = {
  matchUsers,
  notifyUsers
};
