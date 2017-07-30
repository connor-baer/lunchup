const winston = require('winston');
const express = require('express');
const respond = require('../../lib/message');
const { addUser } = require('../../lib/db');
const config = require('../../config.json').config;

const { SLACK_VERIFICATION_TOKEN } = config;

const router = express.Router();

/* POST actions */
router.post('/', (req, res) => {
  const path = '/api/actions';
  winston.info(`Requested ${path}`);

  const content = JSON.parse(req.body.payload);
  const { token, team, user, actions, response_url } = content;

  if (token !== SLACK_VERIFICATION_TOKEN) {
    res.status(401).end('Unauthorized');
    return;
  }

  const action = actions[0];

  if (!action) {
    res.status(422).end('No action specified');
  }

  // Best practice to respond with empty 200 status code.
  res.status(200).end();

  let message = {};

  winston.info(`Action: ${action.name}`);

  switch (action.name) {
    case 'optin':
      message = {
        response_type: 'ephermal',
        text: `🎉 Awesome! Happy to have you on board.`,
        replace_original: true
      };
      addUser(team.id, user);
      break;
    case 'optout':
      message = {
        response_type: 'ephermal',
        text: `😔 Too bad! Should you change your mind in the future, send me a message @lunchup.`,
        replace_original: true
      };
      break;
    default:
      message = {
        response_type: 'ephermal',
        text: `🚨 This action hasn't been configured yet`,
        replace_original: false
      };
  }

  respond(response_url, message);
});

module.exports = router;
