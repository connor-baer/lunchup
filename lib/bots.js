const logger = require('./logger');
const { includes } = require('lodash');
const RtmClient = require('@slack/client').RtmClient;
const WebClient = require('@slack/client').WebClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const { config } = require('../config.json');
const { contains } = require('./helpers');
const { sendResponse } = require('./interactions');
const { getTeam } = require('./db');

const bots = [];

function startBot(teamId) {
  return getTeam(teamId)
    .then(team => {
      const SLACK_BOT_TOKEN = team.sys.bot.bot_access_token;
      const SLACK_API_TOKEN = team.sys.access_token;

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

        if (!text || !contains(text, [`<@${rtm.activeUserId}>`])) {
          return;
        }

        logger.info(`Message received: ${JSON.stringify(message)}`);

        switch (true) {
          case contains(text, [
            'join',
            'take part',
            'participate',
            'sign up',
            'opt in',
            'start'
          ]):
            rtm.sendMessage(`Hello <@${user}>!`, channel);
            web.chat.postMessage(
              channel,
              'be paired up for lunch with a random coworker every week?',
              {
                response_type: 'ephermal',
                attachments: JSON.stringify([
                  {
                    text:
                      'Would you like to take part?',
                    fallback: 'You are unable to participate at the moment.',
                    callback_id: 'join',
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
                        text: 'Maybe later.',
                        type: 'button',
                        value: 'false'
                      }
                    ]
                  }
                ])
              },
              (err, res) => {
                if (err) {
                  logger.error(err);
                }
              }
            );
            break;
          case contains(text, [
            'snooze',
            'pause',
            'break'
          ]):
            web.chat.postMessage(
              channel,
              'How long would you like to take a break?',
              {
                response_type: 'ephermal',
                attachments: JSON.stringify([
                  {
                    text:
                      'Choose the number of weeks.',
                    fallback: 'Something went wrong.',
                    callback_id: 'snooze',
                    color: '#3388ff',
                    attachment_type: 'default',
                    actions: [
                      {
                        name: 'snooze',
                        text: '1 week',
                        type: 'button',
                        value: '1'
                      },
                      {
                        name: 'snooze',
                        text: '2 weeks',
                        type: 'button',
                        value: '2'
                      },
                      {
                        name: 'snooze',
                        text: '3 weeks',
                        type: 'button',
                        value: '3'
                      }
                    ]
                  }
                ])
              },
              (err, res) => {
                if (err) {
                  logger.error(err);
                }
              }
            );
            break;
          case contains(text, ['hello', 'hi', 'ciao', 'hallo']):
            rtm.sendMessage(`Hello <@${user}>!`, channel);
            break;
          default:
            rtm.sendMessage(
              `I'm sorry <@${user}>, I couldn't understand your message.`,
              channel
            );
        }
      });

      stopBot(teamId);
      rtm.connect();
      rtm.teamId = teamId;
      bots.push(rtm);
      return rtm;
    })
    .catch(err => logger.error(err));
}

function rtmForTeam(teamId) {
  return bots.filter(b => b.teamId === teamId)[0];
}

function stopBot(teamId) {
  const rtm = rtmForTeam(teamId);
  rtm.disconnect();
}

function restartBot(teamId) {
  const rtm = rtmForTeam(teamId);
  rtm.disconnect();
  rtm.connect();
}

module.exports = { startBot, stopBot, restartBot, rtmForTeam };
