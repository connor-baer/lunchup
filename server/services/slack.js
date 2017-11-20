import { find, get } from 'lodash';
import {
  RtmClient,
  WebClient,
  MemoryDataStore,
  RTM_EVENTS
} from '@slack/client';
import { contains } from '../util/contains';
import logger from '../util/logger';
import * as TEAMS from '../services/teams';
import * as MESSAGES from './messages';

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

    const { massage: answer, attachments } = MESSAGES.sayWelcome(
      teamId,
      user,
      rtm.activeUserId
    );

    api.chat.postMessage(
      channel,
      answer,
      {
        response_type: 'ephermal',
        as_user: false,
        attachments
      },
      err => {
        if (err) {
          logger.error(`Failed to send message: ${answer}`, err);
        }
      }
    );
  });

  rtm.on(RTM_EVENTS.MESSAGE, async message => {
    const { channel, user, text, subtype, bot_id, thread_ts } = message;

    if (
      bot_id || // eslint-disable-line camelcase
      subtype ||
      !text ||
      (!contains(text, [`<@${rtm.activeUserId}>`]) && channel[0] !== 'D')
    ) {
      return;
    }

    logger.info(`Message received: ${JSON.stringify(message)}`);

    const responses = [
      {
        keywords: [
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
        ],
        response: MESSAGES.sayWelcome
      },
      {
        keywords: ['snooze', 'pause', 'break', 'resume'],
        response: MESSAGES.saySnooze
      },
      {
        keywords: ['leave', 'sign out', 'opt out', 'stop', 'bye'],
        response: MESSAGES.sayLeave
      },
      {
        keywords: ['location', 'city', 'country', 'office', 'place'],
        response: MESSAGES.sayLocation
      },
      {
        keywords: ['help', 'keywords', 'option', 'support', 'question'],
        response: MESSAGES.sayHelp
      },
      {
        keywords: ['fuck', 'shit', 'asshole', 'bitch'],
        response: MESSAGES.sayFuck
      }
    ];

    const { response = MESSAGES.sayDefault } =
      find(responses, item => contains(text, item.keywords)) || {};
    const { message: answer, attachments } = await response(
      teamId,
      user,
      rtm.activeUserId
    );

    api.chat.postMessage(
      channel,
      answer,
      {
        thread_ts,
        response_type: 'ephermal',
        as_user: false,
        attachments
      },
      err => {
        if (err) {
          logger.error(`Failed to send message: ${answer}`, err);
        }
      }
    );
  });

  rtm.start();
  rtm.teamId = teamId;
  bots.push(rtm);
}

export async function initSlack(teamId) {
  try {
    const team = await TEAMS.getTeam(teamId);
    const botAccessToken = get(team, 'bot.bot_access_token');

    startApi(teamId, botAccessToken);
    await startBot(teamId, botAccessToken);
  } catch (e) {
    logger.error('Failed to initialize a Slack team', e);
  }
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
