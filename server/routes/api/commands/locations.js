import { find } from 'lodash';
import logger from '../../../util/logger';
import { sendResponse } from '../../../services/interactions';
import * as LOCATIONS from '../../../services/locations';

export async function handleLocations(teamId, responseUrl, words) {
  const action = words[1];
  const location = words.slice(2);
  if (!action) {
    return new Error('No action specified');
  }
  const handlers = [
    {
      keyword: 'add',
      handler: handleAdd
    },
    {
      keyword: 'remove',
      handler: handleRemove
    },
    {
      keyword: 'list',
      handler: handleList
    }
  ];
  const { handler } = find(handlers, { keyword: action }) || {};
  return handler(teamId, responseUrl, location);
}

async function handleAdd(teamId, responseUrl, location) {
  try {
    await LOCATIONS.addLocation(teamId, location);
    return sendResponse(responseUrl, {
      response_type: 'ephermal',
      text: `✅ Added ${location} to the available locations.`
    });
  } catch (e) {
    logger.error(`Failed to add ${location}`, e);
    return sendResponse(responseUrl, {
      response_type: 'ephermal',
      text: `⛔ Failed to add ${location}.`
    });
  }
}

async function handleRemove(teamId, responseUrl, location) {
  try {
    await LOCATIONS.removeLocation(teamId, location);
    return sendResponse(responseUrl, {
      response_type: 'ephermal',
      text: `✅ Removed ${location} from the available locations.`
    });
  } catch (e) {
    logger.error(`Failed to remove ${location}`, e);
    return sendResponse(responseUrl, {
      response_type: 'ephermal',
      text: `⛔ Failed to remove ${location}.`
    });
  }
}

async function handleList(teamId, responseUrl, location) {
  try {
    const locations = await LOCATIONS.getLocations(teamId, location);
    const numberOfLocations = locations.length;
    const locationNames = locations.map(item => item.name).join(', ');
    return sendResponse(responseUrl, {
      response_type: 'ephermal',
      text: `ℹ️ There are ${numberOfLocations} locations: ${locationNames}.` // eslint-disable-line max-len
    });
  } catch (e) {
    logger.error('Failed to list the locations.', e);
    return sendResponse(responseUrl, {
      response_type: 'ephermal',
      text: '⛔ Failed to list the locations.'
    });
  }
}
