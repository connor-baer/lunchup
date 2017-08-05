const logger = require('../../lib/logger');
const express = require('express');
const { config } = require('../../config.json');

const { SLACK_VERIFICATION_TOKEN } = config;

const router = express.Router();

/* Post events challenge */
router.post('/', (req, res) => {
  const { response_url, event } = req.body;

  if (!event) {
    res.status(422).end('No event specified');
    return;
  }

  if (event.type === 'url_verification') {
    const { token, challenge } = req.body;
    logger.info(`Challenge: ${challenge}`);

    if (token === SLACK_VERIFICATION_TOKEN) {
      res.json({ challenge });
      return;
    }
    res.status(401).end('Unauthorized');
  }

  // Best practice to respond with empty 200 status code.
  res.status(200).end();

  let message = {};

  switch (event.type) {
    case 'message':
      message = {
        response_type: 'in_channel',
        text: 'Hi there'
      };
      respond(response_url, message);
      break;
    default:
      logger.info(event.type);
  }
});

module.exports = router;
