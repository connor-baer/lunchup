const winston = require('winston');
winston.add(winston.transports.File, { filename: 'node.log' });

const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const storage = require('./utils/storage');

module.exports = (SLACK_BOT_TOKEN) => {
  const rtm = new RtmClient(SLACK_BOT_TOKEN);

  // The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    winston.info(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
  });

  rtm.start();
}
