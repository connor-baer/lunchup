import { colors } from './colors';

export const join = () => [
  {
    text: 'Would you like to take part?',
    fallback: 'You are currently unable to participate.',
    callback_id: 'join',
    color: colors.primary,
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
];

export const snooze = () => [
  {
    text: 'Choose the number of weeks.',
    fallback: 'Something went wrong.',
    callback_id: 'snooze',
    color: colors.primary,
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
        text: 'Resume',
        style: 'danger',
        type: 'button',
        value: 'false'
      }
    ]
  }
];

export const leave = () => [
  {
    text: 'Confirm that you want to leave below.',
    fallback: 'Something went wrong.',
    callback_id: 'leave',
    color: colors.primary,
    attachment_type: 'default',
    actions: [
      {
        name: 'leave',
        text: 'Leave',
        style: 'danger',
        type: 'button',
        value: 'true'
      },
      {
        name: 'leave',
        text: 'Cancel',
        type: 'button',
        value: 'false'
      }
    ]
  }
];

export const location = options => [
  {
    text: 'Where do you work?',
    fallback: 'You are currently unable to pick a location',
    color: colors.primary,
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
];
