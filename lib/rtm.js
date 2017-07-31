const winston = require('winston');
const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

function createRtm(SLACK_BOT_TOKEN) {
  const rtm = new RtmClient(SLACK_BOT_TOKEN);

  let channel;

  // The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, rtmStartData => {
    const channelInfo = rtmStartData.channels.filter(
      c => c.is_member && c.name === 'hack-lunchup'
    );

    channel = channelInfo.id;

    winston.info(
      `Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team
        .name}, but not yet connected to a channel.`
    );
  });

  // you need to wait for the client to fully connect before you can send messages
  rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    rtm.sendResponse('Hello!', channel);
  });

  rtm.on(CLIENT_EVENTS.RTM.MESSAGE, message => {
    winston.info('Message:' + JSON.stringify(message));
  });

  rtm.start();
}

module.exports = { createRtm };
