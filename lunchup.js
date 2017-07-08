'use strict';

const express = require('express');
const request = require('request');
const config = require('./config.json');
const bodyParser = require('body-parser');
const respond = require('./utils/respond');
const message = require('./utils/message');
const storage = require('./utils/storage');
const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const token = config.SLACK_VERIFICATION_TOKEN;

const crypto = require('crypto');
const post = require('./utils/post');

function messageUsers(error, response, body) {
  if (error) {
    console.log(error);
    return;
  }
  const url = 'https://slack.com/api/chat.postMessage';
  const content = JSON.parse(body);
  const channel = content.group.id;
  const text = "Test: You've been matched for lunch!";
  const message = { token, channel, text };
  message(url, message);
}

function notifyUsers(users) {
  return new Promise((resolve, reject) => {
    const url = 'https://slack.com/api/mpim.open';
    const message = { token, users };
    post(url, message, messageUsers);
  });
}

function matchUsers(users, date) {
  if (users.length < 1) {
    return;
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
      notifyUsers([person1, person2])
        .then(status => matchUsers(users, date))
        .catch(error => console.log(error));
    })
    .catch(error => {
      console.log(error);
      matchUsers(users, date);
    });
}

function getUsers() {
  const data = storage.getData('users');

  if (!data) {
    return;
  }

  let { users } = data;
  let date = new Date();
  console.log('getUsers');

  matchUsers(users, date);
}

// getUsers();

// TODO: Verify Slack token.

/*
 * Actions
 */

app.post('/slack/actions', urlencodedParser, (req, res) => {
  // Best practice to respond with empty 200 status code.
  res.status(200).end();
  const content = JSON.parse(req.body.payload);

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
        replace_original: true
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
    return;
  }

  if (command[0] !== '/') {
    res.status(422).end('Commands must start with /');
    return;
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
        text: 'Matching the participants...'
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

/*
 * Events
 */

app.post('/slack/events', urlencodedParser, (req, res) => {
  // Best practice to respond with empty 200 status code.
  res.status(200).end();
  const content = req.body;
  const { response_url, event } = content;

  if (!event) {
    res.status(422).end('No event specified');
    return;
  }

  let message = {};

  switch (event.type) {
    case 'url_verification':
      message = {
        response_type: 'in_channel',
        text:
          'Would you like to be paired up for lunch with a random coworker every week?'
      };
      respond(response_url, message);
      break;
    case 'im_':
      message = {
        response_type: 'in_channel',
        text: 'Matching the participants...'
      };
      respond(response_url, message);
      getUsers();
      break;
    default:
      message = {
        response_type: 'in_channel',
        text: "This command hasn't been configured yet."
      };
      respond(response_url, message);
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(8080, () => {
  console.log('LunchUp listening on port 8080.');
});
