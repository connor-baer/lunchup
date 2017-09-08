import { find } from 'lodash';
import {
  RtmClient,
  WebClient,
  MemoryDataStore,
  RTM_EVENTS
} from '@slack/client';
import MESSAGE from './messages';
import { contains } from './helpers';
import { getTeam, getLocations } from './db';
import logger from './logger';

const apis = [];
const bots = [];

export function apiForTeam(teamId) {
  return find(apis, { teamId });
}

export function rtmForTeam(teamId) {
  return find(bots, { teamId });
}

export function startApi(teamId, apiToken) {
  const api = new WebClient(apiToken);

  api.teamId = teamId;
  apis.push(api);
}

export function startBot(teamId, botToken) {
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

  rtm.on(RTM_EVENTS.MEMBER_JOINED_CHANNEL, message => {
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
    const { channel, user, text, subtype, bot_id, thread_ts } = message;

    if (
      bot_id ||
      subtype ||
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
        'sup',
        'welcome'
      ]): {
        api.chat.postMessage(
          channel,
          `Hi <@${user}>! 👋 <@${rtm.activeUserId}> matches up two random coworkers every week to go on a blind lunch.`,
          {
            thread_ts,
            response_type: 'ephermal',
            as_user: false,
            attachments: MESSAGE.join()
          },
          (err, res) => {
            if (err) {
              logger.error(err);
            }
          }
        );
        break;
      }
      case contains(text, ['snooze', 'pause', 'break']): {
        api.chat.postMessage(
          channel,
          'How long would you like to take a break?',
          {
            thread_ts,
            response_type: 'ephermal',
            as_user: false,
            attachments: MESSAGE.snooze()
          },
          (err, res) => {
            if (err) {
              logger.error(err);
            }
          }
        );
        break;
      }
      case contains(text, ['leave', 'sign out', 'opt out', 'stop', 'bye']): {
        api.chat.postMessage(
          channel,
          `Are you sure you want to leave? You can also take a break. Just ask me (<@${rtm.activeUserId}>).`,
          {
            thread_ts,
            response_type: 'ephermal',
            as_user: false,
            attachments: MESSAGE.leave()
          },
          (err, res) => {
            if (err) {
              logger.error(err);
            }
          }
        );
        break;
      }
      case contains(text, ['location', 'city', 'office', 'place']): {
        getLocations(teamId).then(locations => {
          const locationOptions = locations.map(location => ({
            text: decodeURI(location.city),
            value: location.city
          }));
          api.chat.postMessage(
            channel,
            'No problem! You can update your location below.',
            {
              thread_ts,
              response_type: 'ephermal',
              as_user: false,
              attachments: MESSAGE.location(locationOptions)
            },
            (err, res) => {
              if (err) {
                logger.error(err);
              }
            }
          );
        });
        break;
      }
      case contains(text, [
        'help',
        'keywords',
        'option',
        'support',
        'question'
      ]): {
        rtm.send({
          text: `Hi, my name is <@${rtm.activeUserId}>! 👋 I match up two random coworkers every week to go on a blind lunch. You can *join*, *take a break*, *leave*, or *update your location*. Just send me a message that includes one of these keywords or a similar one.`,
          channel,
          thread_ts,
          type: RTM_EVENTS.MESSAGE
        });
        break;
      }
      case contains(text, ['fuck', 'shit', 'asshole', 'bitch']): {
        rtm.send({
          text: '💩 https://www.youtube.com/watch?v=hpigjnKl7nI',
          channel,
          thread_ts,
          type: RTM_EVENTS.MESSAGE
        });
        break;
      }
      default: {
        rtm.send({
          text: `I'm sorry <@${user}>, I couldn't understand your message. Sometimes I have an easier time with a few simple keywords.`,
          channel,
          thread_ts,
          type: RTM_EVENTS.MESSAGE
        });
      }
    }
  });

  rtm.start();
  rtm.teamId = teamId;
  bots.push(rtm);
}

export function initSlack(teamId) {
  return getTeam(teamId)
    .then(team => {
      const SLACK_BOT_TOKEN = team.sys.bot.bot_access_token;

      startApi(teamId, SLACK_BOT_TOKEN);
      startBot(teamId, SLACK_BOT_TOKEN);
    })
    .catch(err => logger.error(err));
}

export function stopBot(teamId) {
  const rtm = rtmForTeam(teamId);
  rtm.disconnect();
}

export function restartBot(teamId) {
  const rtm = rtmForTeam(teamId);
  rtm.disconnect();
  rtm.start();
}
