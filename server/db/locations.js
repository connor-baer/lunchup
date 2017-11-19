import monk from 'monk';
import CONFIG from '../../config';
import logger from '../util/logger';

const db = monk(CONFIG.mongodb.url);
const locations = db.get('locations', { castIds: false });

getLocations.operation = 'READ';
export function getLocations(teamId) {
  logger.debug('getLocations', teamId);
  return locations.find({ team_id: teamId });
}

getLocation.operation = 'READ';
getLocation.byId = true;
export function getLocation(_id) {
  logger.debug('getLocation', _id);
  return locations.findOne({ _id });
}

updateLocation.operation = 'UPDATE';
updateLocation.invalidates = ['getLocations', 'getLocation'];
export function updateLocation(location) {
  logger.debug('updateLocation', location);
  const { _id } = location;
  return locations.update({ _id }, location, {
    upsert: true
  });
}

removeLocation.operation = 'DELETE';
removeLocation.invalidates = ['getLocations', 'getLocation'];
export function removeLocation(_id) {
  logger.debug('removeLocation', _id);
  return locations.remove({ _id });
}
