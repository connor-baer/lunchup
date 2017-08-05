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
    logLevel: 'debug',
    // Initialise a data store for our client, this will load additional helper functions for the storing and retrieval of data
    dataStore: new MemoryDataStore(),
    useConnect: true
  });
  rtm.start();

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
    const { channel } = message;

    rtm.sendMessage(
      `I'm sorry <@${user}>, I can't understand your message.`,
      channel
    );
  });
}

module.exports = { initSlack };
