const logger = require('./logger');
const { includes, find } = require('lodash');
const RtmClient = require('@slack/client').RtmClient;
const WebClient = require('@slack/client').WebClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const { config } = require('../config.json');
const MESSAGE = require('./messages');
const { contains } = require('./helpers');
const { getTeam, getLocations } = require('./db');

function initSlack(teamId) {
  return getTeam(teamId)
    .then(team => {
      const SLACK_BOT_TOKEN = team.sys.bot.bot_access_token;
      const SLACK_API_TOKEN = team.sys.access_token;

      startApi(teamId, SLACK_API_TOKEN);
      startBot(teamId, SLACK_BOT_TOKEN);
    })
    .catch(err => logger.error(err));
}

const apis = [];
const bots = [];

function startApi(teamId, apiToken) {
  const api = new WebClient(apiToken);

  api.teamId = teamId;
  apis.push(api);
}

function startBot(teamId, botToken) {
  const rtm = new RtmClient(botToken, {
    logLevel: 'error',
    dataStore: new MemoryDataStore(),
    useConnect: true,
    autoReconnect: true
  });

  const api = apiForTeam(teamId);

  // The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
  rtm.on(RTM_EVENTS.AUTHENTICATED, rtmStartData => {
    rtm.userId = rtmStartData.self.id;
    logger.info(
      `Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`
    );
  });

  // You need to wait for the client to fully connect before you can send messages.
  rtm.on(RTM_EVENTS.RTM_CONNECTION_OPENED, () => {
    logger.info('Connection opened.');
  });

  rtm.on(RTM_EVENTS.MEMBER_JOINED_CHANNEL, () => {
    const { channel, user } = message;

    if (user !== rtm.activeUserId) {
      return;
    }

    api.chat.postMessage(
      channel,
      `Hello! <@${rtm.activeUserId}> matches up two random coworkers every week to go on a blind lunch.`,
      MESSAGE.join(),
      (err, res) => {
        if (err) {
          logger.error(err);
        }
      }
    );
  });

  rtm.on(RTM_EVENTS.MESSAGE, message => {
    const { channel, user, text, subtype, bot_id } = message;

    if (
      bot_id ||
      subtype === 'bot_message' ||
      !text ||
      (!contains(text, [`<@${rtm.activeUserId}>`]) && channel[0] !== 'D')
    ) {
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
        'start',
        'hello',
        'hi',
        'ciao',
        'hallo',
        'yo'
      ]):
        api.chat.postMessage(
          channel,
          `Hi <@${user}>! <@${rtm.activeUserId}> matches up two random coworkers every week to go on a blind lunch.`,
          MESSAGE.join(),
          (err, res) => {
            if (err) {
              logger.error(err);
            }
          }
        );
        break;
      case contains(text, ['snooze', 'pause', 'break']):
        api.chat.postMessage(
          channel,
          'How long would you like to take a break?',
          MESSAGE.snooze(),
          (err, res) => {
            if (err) {
              logger.error(err);
            }
          }
        );
        break;
      case contains(text, ['location', 'city', 'office', 'place']):
        getLocations(teamId).then(locations => {
          const locationOptions = locations.map(location => {
            return { text: decodeURI(location.city), value: location.city };
          });
          api.chat.postMessage(
            channel,
            'No problem! You can update your location below.',
            MESSAGE.location(locationOptions),
            (err, res) => {
              if (err) {
                logger.error(err);
              }
            }
          );
        });
        break;
      default:
        rtm.sendMessage(
          `I'm sorry <@${user}>, I couldn't understand your message. Sometimes I have an easier time with a few simple keywords.`,
          channel
        );
    }
  });

  rtm.start();
  rtm.teamId = teamId;
  bots.push(rtm);
}

function apiForTeam(teamId) {
  return find(apis, { teamId: teamId });
}

function rtmForTeam(teamId) {
  return find(bots, { teamId: teamId });
}

function stopBot(teamId) {
  const rtm = rtmForTeam(teamId);
  rtm.disconnect();
}

function restartBot(teamId) {
  const rtm = rtmForTeam(teamId);
  rtm.disconnect();
  rtm.start();
}

module.exports = { initSlack, stopBot, restartBot, rtmForTeam, apiForTeam };
