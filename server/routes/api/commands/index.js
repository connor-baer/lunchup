import express from 'express';
import { find } from 'lodash';
import logger from '../../../util/logger';
import CONFIG from '../../../../config';

import { handleUsers } from './users';
import { handleLocations } from './locations';
import { handleMatch } from './match';
import { handleBot } from './bot';
import { handleDefault } from './default';

const router = express.Router();

/* POST commands */
router.post('/', (req, res) => {
  const { response_url, command, text, token, team_id } = req.body;

  if (token !== CONFIG.slack.verificationToken) {
    return res.status(401).end('Unauthorized');
  }
  if (!command) {
    res.status(422).end('No command specified');
  }
  if (command[0] !== '/') {
    res.status(422).end('Commands must start with /');
  }
  if (command !== '/lunchup') {
    res.status(422).end('This command is not supported.');
  }

  // Best practice to respond with empty 200 status code.
  res.status(200).end('Working on it...');

  logger.info(`Command: ${command} ${text}`);

  const words = text.split(' ');
  const handlers = [
    {
      keyword: 'users',
      handler: handleUsers
    },
    {
      keyword: 'locations',
      handler: handleLocations
    },
    {
      keyword: 'match',
      handler: handleMatch
    },
    {
      keyword: 'bot',
      handler: handleBot
    }
  ];
  const { handler = handleDefault } =
    find(handlers, { keyword: words[0] }) || {};
  return handler(team_id, response_url, words);
});

export { router as commands };
