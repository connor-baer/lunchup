import * as MESSAGE from '../constants/messages';
import * as LOCATIONS from '../services/locations';

export function sayWelcome(teamId, userId, botId) {
  return {
    message: `Hi <@${userId}>! 👋 <@${
      botId
    }> (that's me) matches up two random coworkers every week to go on a blind lunch.`, // eslint-disable-line max-len
    attachments: MESSAGE.join()
  };
}

export function saySnooze() {
  return {
    message: 'How long would you like to take a break?',
    attachments: MESSAGE.snooze()
  };
}

export function sayLeave() {
  return {
    message: `Are you sure you want to leave? You can also take a break. Just ask me.`, // eslint-disable-line max-len
    attachments: MESSAGE.leave()
  };
}

export async function sayLocation(teamId) {
  const locations = await LOCATIONS.getLocations(teamId);
  const locationOptions = locations.map(location => ({
    text: decodeURI(location.name),
    value: location.name
  }));
  return {
    message: 'No problem! You can update your location below.',
    attachments: MESSAGE.location(locationOptions)
  };
}

export function sayHelp(teamId, userId, botId) {
  return {
    message: `Hi, my name is <@${
      botId
    }>! 👋 I match up two random coworkers every week to go on a blind lunch. You can *join*, *take a break*, *leave*, or *update your location*. Just send me a message that includes one of these keywords or a similar one.` // eslint-disable-line max-len
  };
}

export function sayFuck() {
  return { message: '💩 https://www.youtube.com/watch?v=hpigjnKl7nI' };
}

export function sayDefault(teamId, userId) {
  return {
    message: `I'm sorry <@${
      userId
    }>, I couldn't understand your message. Sometimes I have an easier time with a few simple keywords.` // eslint-disable-line max-len
  };
}
