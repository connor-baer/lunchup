const logger = require('../../lib/logger');
const express = require('express');
const { config } = require('../../config.json');

const { SLACK_VERIFICATION_TOKEN } = config;

const router = express.Router();

/* Post events challenge */
router.post('/', (req, res) => {
  const { token, challenge } = req.body;
  logger.info(`Challenge: ${challenge}`);

  if (token === SLACK_VERIFICATION_TOKEN) {
    res.json({ challenge });
    return;
  }
  res.status(401).end('Unauthorized');
});

module.exports = router;
