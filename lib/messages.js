const logger = require('./logger');
const { config } = require('../config.json');
const { getTeam, getLocations } = require('./db');

const color = '#3388ff';

const join = () => ({
  response_type: 'ephermal',
  as_user: true,
  attachments: JSON.stringify([
    {
      text: 'Would you like to take part?',
      fallback: 'You are currently unable to participate.',
      callback_id: 'join',
      color,
      attachment_type: 'default',
      actions: [
        {
          name: 'join',
          text: 'Yes please!',
          style: 'primary',
          type: 'button',
          value: 'true'
        },
        {
          name: 'join',
          text: 'Maybe later.',
          type: 'button',
          value: 'false'
        }
      ]
    }
  ])
});

const snooze = () => ({
  response_type: 'ephermal',
  as_user: true,
  attachments: JSON.stringify([
    {
      text: 'Choose the number of weeks.',
      fallback: 'Something went wrong.',
      callback_id: 'snooze',
      color,
      attachment_type: 'default',
      actions: [
        {
          name: 'snooze',
          text: '1 week',
          type: 'button',
          value: '1'
        },
        {
          name: 'snooze',
          text: '2 weeks',
          type: 'button',
          value: '2'
        },
        {
          name: 'snooze',
          text: '3 weeks',
          type: 'button',
          value: '3'
        },
        {
          name: 'snooze',
          text: 'Cancal',
          style: 'danger',
          type: 'button',
          value: 'false'
        }
      ]
    }
  ])
});

const location = (options) => ({
  response_type: 'ephermal',
  as_user: true,
  attachments: JSON.stringify([
    {
      text: 'Where do you work?',
      fallback: 'You are currently unable to pick a location',
      color,
      attachment_type: 'default',
      callback_id: 'location',
      actions: [
        {
          name: 'location',
          text: 'Choose a city...',
          type: 'select',
          options
        }
      ]
    }
  ])
});

module.exports = { join, snooze, location };