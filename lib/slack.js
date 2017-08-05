const logger = require('./logger');
const { includes } = require('lodash');
const RtmClient = require('@slack/client').RtmClient;
const WebClient = require('@slack/client').WebClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const { config } = require('../config.json');
const { sendResponse } = require('./interactions');

function initSlack(SLACK_BOT_TOKEN, SLACK_API_TOKEN) {
  const rtm = new RtmClient(SLACK_BOT_TOKEN, {
    // Sets the level of logging we require
    logLevel: 'error',
    // Initialise a data store for our client, this will load additional helper functions for the storing and retrieval of data
    dataStore: new MemoryDataStore()
  });

  const web = new WebClient(SLACK_API_TOKEN);

  // The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
  rtm.on(RTM_EVENTS.AUTHENTICATED, rtmStartData => {
    logger.info(
      `Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team
        .name}`
    );
  });

  // You need to wait for the client to fully connect before you can send messages.
  rtm.on(RTM_EVENTS.RTM_CONNECTION_OPENED, () => {
    logger.info('Connection opened.');
  });

  rtm.on(RTM_EVENTS.MESSAGE, message => {
    const { channel, user, text } = message;

    const content = text.toLowerCase();

    function contains(string = content, substrings) {
      return substrings.some(substring => includes(string, substring));
    }

    if (!contains(['@lunchup'])) {
      return;
    }

    logger.info(`Message received: ${JSON.stringify(message)}`);

    switch (true) {
      case contains(['join', 'take part', 'participate', 'sign up']):
        web.chat.postMessage(
          channel,
          {
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
          },
          (err, res) => {
            if (err) {
              logger.error('Error:', err);
            } else {
              logger.info('Message sent: ', res);
            }
          }
        );
        break;
      case contains(['hello', 'hi', 'ciao', 'hallo']):
        rtm.sendMessage(`Hello <@${user}>!`, channel);
        break;
      default:
        rtm.sendMessage(
          `I'm sorry <@${user}>, I can't understand your message.`,
          channel
        );
    }
  });

  rtm.start();
}

module.exports = { initSlack };
