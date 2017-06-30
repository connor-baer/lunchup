var express = require('express');
var request = require('request');
var config = require('./config.json');
var bodyParser = require('body-parser');
var respond = require('./utils/respond');
var message = require('./utils/message');
var storage = require('./utils/storage');
var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

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
        text: `Awesome! Happy to have you on board.`,
        replace_original: true
      };
      failure = {
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
        text: `Too bad! Should you change your mind in the future, send me a message @lunchup.`,
        replace_original: true
      };
      respond(response_url, message);
      break;
    default:
      message = {
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
  const responseURL = content.response_url;
  const command = content.command;

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
      break;
    default:
      message = {
        response_type: 'in_channel',
        text: "This command hasn't been configured yet"
      };
  }
  respond(responseURL, message);
});

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.listen(8080, function() {
  console.log('LunchUp listening on port 8080.');
});
