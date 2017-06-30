var express = require('express');
var request = require('request');
var config = require('./config.json');
var bodyParser = require('body-parser');
var respond = require('./utils/respond');
var message = require('./utils/message');
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
  const responseURL = content.response_url;
  let action = content.actions[0];

  if (!action) {
    res.status(422).end('No action specified');
  }

  let name = action.name;

  let message = {}

  switch (name) {
    case 'join':
      message = {
        text: `Awesome! Happy to have you on board.`,
        "replace_original": true
      };
      break;
    default:
      message = {
        response_type: 'in_channel',
        text: "This action hasn't been configured yet"
      };
  }
  respond(responseURL, message);
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

  let message = {}

  switch (name) {
    case 'lunch':
      message = {
        response_type: 'in_channel',
        attachments: [
          {
            text:
              '*Would you like to be paired up for lunch with a random coworker every week?*',
            fallback: 'You are unable to participate.',
            callback_id: 'wopr_game',
            color: '#3388ff',
            attachment_type: 'default',
            actions: [
              {
                name: 'join',
                text: 'Yes please!',
                style: 'primary',
                type: 'button',
                value: 'true'
              },
              {
                name: 'join',
                text: 'No thanks.',
                style: 'danger',
                type: 'button',
                value: 'false'
              },
              {
                name: 'join',
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

// app.post('/slack/actions', urlencodedParser, (req, res) => {
//   res.status(200).end(); // best practice to respond with 200 status
//   var actionJSONPayload = JSON.parse(req.body.payload); // parse URL-encoded payload JSON string
//   var message = {
//     text:
//       actionJSONPayload.user.name +
//       ' clicked: ' +
//       actionJSONPayload.actions[0].name,
//     replace_original: false
//   };
//   sendMessageToSlackResponseURL(actionJSONPayload.response_url, message);
// });


app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.listen(8080, function() {
  console.log('LunchUp listening on port 8080.');
});
