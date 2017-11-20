import express from 'express';
import logger from '../../util/logger';
import { sendResponse } from '../../services/interactions';
import CONFIG from '../../../config';

const router = express.Router();

/* Post events challenge */
router.post('/', (req, res) => {
  if (req.body.type === 'url_verification') {
    const { token, challenge } = req.body;

    logger.info(`Challenge: ${challenge}`);

    if (token === CONFIG.slack.verificationToken) {
      return res.json({ challenge });
    }
    res.status(401).end('Unauthorized');
  }

  const { response_url, event } = req.body;

  if (!event) {
    return res.status(422).end('No event specified');
  }

  // Best practice to respond with empty 200 status code.
  res.status(200).end();

  if (event.type === 'message') {
    return sendResponse(response_url, {
      response_type: 'in_channel',
      text: 'Hi there'
    });
  }
  return logger.info(event.type);
});

export { router as events };
