const express = require('express');
const request = require('request');
const config = require('./config.json');
const bodyParser = require('body-parser');
const respond = require('./utils/respond');
const message = require('./utils/message');
const storage = require('./utils/storage');
const app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const crypto = require('crypto');
const post = require('./utils/post');

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

// TODO: Verify Slack token.

/*
 * Actions
 */

app.post('/slack/actions', urlencodedParser, (req, res) => {
  // Best practice to respond with empty 200 status code.
  res.status(200).end();
  var content = JSON.parse(req.body.payload);

  const { token, team, channel, user, actions, response_url } = content;
  let action = actions[0];

  if (!action) {
    res.status(422).end('No action specified');
  }

  let success = {};
  let failure = {};
  let message = {};

  switch (action.name) {
    case 'optin':
      success = {
        response_type: 'ephermal',
        text: `Awesome! Happy to have you on board.`,
        replace_original: true,

      };
      failure = {
        response_type: 'ephermal',
        text: `You've already signed up!`,
        replace_original: true
      };
      storage
        .addItem('users', user)
        .then(status => {
          console.log(status);
          respond(response_url, success);
        })
        .catch(error => {
          console.log(error);
          respond(response_url, failure);
        });
      break;
    case 'optout':
      message = {
        response_type: 'ephermal',
        text: `Too bad! Should you change your mind in the future, send me a message @lunchup.`,
        replace_original: true
      };
      respond(response_url, message);
      break;
    default:
      message = {
        response_type: 'ephermal',
        response_type: 'in_channel',
        text: "This action hasn't been configured yet",
        replace_original: false
      };
      respond(response_url, message);
  }
});

/*
 * Commands
 */

app.post('/slack/commands', urlencodedParser, (req, res) => {
  // Best practice to respond with empty 200 status code.
  res.status(200).end();
  const content = req.body;
  const { response_url, command } = content;

  if (!command) {
    res.status(422).end('No command specified');
  }

  if (command[0] !== '/') {
    res.status(422).end('Commands must start with /');
  }

  let name = command.substr(1);

  let message = {};

  switch (name) {
    case 'lunch':
      message = {
        response_type: 'in_channel',
        attachments: [
          {
            text:
              'Would you like to be paired up for lunch with a random coworker every week?',
            fallback: 'You are unable to participate.',
            callback_id: 'wopr_game',
            color: '#3388ff',
            attachment_type: 'default',
            actions: [
              {
                name: 'optin',
                text: 'Yes please!',
                style: 'primary',
                type: 'button',
                value: 'true'
              },
              {
                name: 'optout',
                text: 'No thanks.',
                style: 'danger',
                type: 'button',
                value: 'false'
              },
              {
                name: 'later',
                text: 'Maybe later.',
                type: 'button',
                value: 'later'
              }
            ]
          }
        ]
      };
      respond(response_url, message);
      break;
      case 'lunchup':
        message = {
          response_type: 'in_channel',
          text: "Matching the participants..."
        };
        respond(response_url, message);
        getUsers();
        break;
    default:
      message = {
        response_type: 'in_channel',
        text: "This command hasn't been configured yet"
      };
      respond(response_url, message);
  }
});

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.listen(8080, function() {
  console.log('LunchUp listening on port 8080.');
});
