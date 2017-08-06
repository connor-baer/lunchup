const logger = require('./logger');
const { includes } = require('lodash');
const RtmClient = require('@slack/client').RtmClient;
const WebClient = require('@slack/client').WebClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const { config } = require('../config.json');
const { contains } = require('./message');
const { sendResponse } = require('./interactions');
const { getTeam } = require('./db');

const bots = [];

function startBot(teamId) {
  return getTeam(teamId)
    .then(team => {
      const SLACK_BOT_TOKEN = team.bot.bot_access_token;
      const SLACK_API_TOKEN = team.access_token;

      const rtm = new RtmClient(SLACK_BOT_TOKEN, {
        logLevel: 'error',
        dataStore: new MemoryDataStore(),
        useConnect: true,
        autoReconnect: true
      });

      const web = new WebClient(SLACK_API_TOKEN);

      // The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
      rtm.on(RTM_EVENTS.AUTHENTICATED, rtmStartData => {
        rtm.userId = rtmStartData.self.id;
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

        if (!contains(text, [`<@${rtm.activeUserId}>`])) {
          return;
        }

        logger.info(`Message received: ${JSON.stringify(message)}`);

        switch (true) {
          case contains(text, ['join', 'take part', 'participate', 'sign up']):
            web.chat.postMessage(
              channel,
              {
                response_type: 'in_channel',
                attachments: JSON.stringify([
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
                ])
              },
              (err, res) => {
                if (err) {
                  logger.error(err);
                } else {
                  logger.info(res);
                }
              }
            );
            break;
          case contains(text, ['hello', 'hi', 'ciao', 'hallo']):
            logger.info('Someone said hello');
            rtm.sendMessage(`Hello <@${user}>!`, channel);
            break;
          default:
            rtm.sendMessage(
              `I'm sorry <@${user}>, I couldn't understand your message.`,
              channel
            );
        }
      });

      rtm.teamId = teamId;
      bots.push(rtm);
      return rtm;
    })
    .catch(err => logger.error(err));
}

function stopBot(teamId) {
  bots.forEach(rtm => {
    if (rtm.teamId === teamId) {
      rtm.disconnect();
    }
  });
}

function rtmForTeam(teamId) {
  return bots.filter(b => b.teamId === teamId)[0];
}

module.exports = { startBot, stopBot, rtmForTeam };
