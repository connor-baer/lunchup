const crypto = require('crypto');
const { sendMessage } = require('./interactions');
const { hasMatch, addMatch, getMatches } = require('./db');

// function messageUsers(error, response, body) {
//   if (error) {
//     console.log(error);
//     return null;
//   }
//   const url = 'https://slack.com/api/chat.postMessage';
//   const content = JSON.parse(body);
//   const channel = content.group.id;
//   const text = "Test: You've been matched for lunch!";
//   const message = { token, channel, text };
//   message(url, message);
// }
//
// function notifyUsers(users) {
//   const url = 'https://slack.com/api/mpim.open';
//   const message = { token, users };
//   sendMessage(url, message, messageUsers);
// }

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
      const randomInt = Math.floor((Math.random() * (usersLeft.length - 1)) + 1);
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
  matchUsers
};
