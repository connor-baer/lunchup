const winston = require('winston');
const express = require('express');
const config = require('../../config.json').config;

const { SLACK_VERIFICATION_TOKEN } = config;

const router = express.Router();

/* Post events challenge */
router.post('/', (req, res) => {
  const path = '/api/events';
  winston.info(`Requested ${path}`);

  const { token, challenge } = req.body;
  winston.info(`Challenge: ${challenge}`);

  if (token === SLACK_VERIFICATION_TOKEN) {
    res.json({ challenge });
    return;
  }
  res.status(401).end('Unauthorized');
});

module.exports = router;
