import monk from 'monk';
import { addMongoDbId } from '../util/addMongoDbId';
import CONFIG from '../../config';

const db = monk(CONFIG.mongodb.url);

const locations = db.get('locations');

getLocations.operation = 'READ';
export function getLocations(teamId) {
  return locations.find({ teamId });
}

getLocation.operation = 'READ';
getLocation.byId = true;
export function getLocation(teamId, locationId) {
  const _id = `${teamId}${locationId}`;
  return locations.find({ _id });
}

updateLocation.operation = 'UPDATE';
// updateLocation.invalidates = ['getLocations'];
export function updateLocation(location) {
  const locationWithId = addMongoDbId(location, ['team_id', 'id']);
  return locations.update({ _id: locationWithId._id }, locationWithId, {
    upsert: true
  });
}

addLocation.operation = 'CREATE';
// addLocation.invalidates = ['getLocations'];
export function addLocation(location) {
  const locationWithId = addMongoDbId(location, ['team_id', 'id']);
  return locations.insert(locationWithId);
}

deleteLocation.operation = 'DELETE';
// deleteLocation.invalidates = ['getLocations'];
export function deleteLocation(teamId, locationId) {
  const _id = `${teamId}${locationId}`;
  return locations.remove({ _id });
}
