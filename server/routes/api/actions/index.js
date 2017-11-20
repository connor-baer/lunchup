import express from 'express';
import { find } from 'lodash';
import logger from '../../../util/logger';
import CONFIG from '../../../../config';

import { handleJoin } from './join';
import { handleSnooze } from './snooze';
import { handleLeave } from './leave';
import { handleLocation } from './location';
import { handleDefault } from './default';

const router = express.Router();

/* POST actions */
router.post('/', (req, res) => {
  const content = JSON.parse(req.body.payload);
  const { token, team, user, actions, response_url } = content;

  if (token !== CONFIG.slack.verificationToken) {
    return res.status(401).end('Unauthorized');
  }

  const action = actions[0];

  if (!action) {
    return res.status(422).end('No action specified');
  }

  // Best practice to respond with empty 200 status code.
  res.status(200).end();

  logger.info(`Action: ${action.name}`);

  const handlers = [
    {
      keyword: 'join',
      handler: handleJoin
    },
    {
      keyword: 'snooze',
      handler: handleSnooze
    },
    {
      keyword: 'leave',
      handler: handleLeave
    },
    {
      keyword: 'location',
      handler: handleLocation
    }
  ];
  const { handler = handleDefault } =
    find(handlers, { keyword: action.name }) || {};
  return handler(team.id, response_url, action, user);
});

export { router as actions };
