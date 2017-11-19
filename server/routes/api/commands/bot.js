import { find } from 'lodash';
import * as SLACK from '../../../services/slack';

export function handleBot(teamId, responseUrl, words) {
  const action = words[1];
  if (!action) {
    return new Error('No action specified');
  }
  const handlers = [
    {
      keyword: 'restart',
      handler: SLACK.restartBot(teamId)
    },
    {
      keyword: 'stop',
      handler: SLACK.stopBot(teamId)
    }
  ];
  const { handler } = find(handlers, { keyword: action }) || {};
  return handler();
}
