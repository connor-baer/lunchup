const cron = require('cron');
const crypto = require('crypto');
const config = require('./config.json');
const storage = require('./utils/storage');
const post = require('./utils/post');

const job = new cron.CronJob(
  '0 10 * * Mon',
  function() {
    getUsers();
  },
  null,
  true
);

function notifyUsers(users) {
  const url = 'https://slack.com/api/mpim.open';
  const token = config.SLACK_VERIFICATION_TOKEN;
  const message = { token, users };
  post(url, message);
}

function matchUsers(users, date) {
  if (users.length === 0) {
    return null;
  }
  let person1 = users[0].id;
  let randomInt = Math.floor(Math.random() * (users.length - 1) + 1);
  let person2 = users[randomInt].id;
  let id = crypto.createHash('sha1').update(person1 + person2).digest('hex');

  let match = { date: date, id: id, users: [person1, person2] };

  storage
    .addItem('matches', match)
    .then(status => {
      console.log(status);
      users = users.filter(
        value => value.id !== person1 && value.id !== person2
      );
      notifyUsers([person1, person2]);
      matchUsers(users, date);
    })
    .catch(error => {
      console.log(error);
      matchUsers(users, date);
    });
}

function getUsers() {
  const data = storage.getData('users');

  if (!data) {
    return null;
  }

  let { users } = data;
  let date = new Date();

  matchUsers(users, date);
}

getUsers();
