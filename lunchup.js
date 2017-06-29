var express = require('express');
var request = require('request');
var config = require('./config.json');
var bodyParser = require('body-parser');
var respond = require('./utils/respond');
var message = require('./utils/message');
var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/slack/commands', urlencodedParser, (req, res) => {
  if (content.token != config.SLACK_VERIFICATION_TOKEN) {
    res.status(403).end('Access forbidden');
  } else {
    // Best practice to respond with empty 200 status code.
    res.status(200).end();
    const content = req.body;
    const responseURL = content.response_url;
    let command = content.command;

    if (!command) {
      return callback(new Error('No command specified'));
    }

    if (command[0] !== '/') {
      return callback(new Error('Commands must start with /'));
    }

    let name = command.substr(1);

    let message = {}

    switch (command) {
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
  }
});

module.exports = (
  user,
  channel,
  text = '',
  command = {},
  botToken = null,
  callback
) => {
  callback(null, {
    response_type: 'in_channel',
    text: `Welcome to LunchUp! Feeling hungry and social?`,
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
  });
};

app.post('/slack/actions', urlencodedParser, (req, res) => {
  res.status(200).end(); // best practice to respond with 200 status
  var actionJSONPayload = JSON.parse(req.body.payload); // parse URL-encoded payload JSON string
  var message = {
    text:
      actionJSONPayload.user.name +
      ' clicked: ' +
      actionJSONPayload.actions[0].name,
    replace_original: false
  };
  sendMessageToSlackResponseURL(actionJSONPayload.response_url, message);
});



app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.listen(8080, function() {
  console.log('LunchUp listening on port 8080.');
});
