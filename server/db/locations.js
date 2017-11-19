import monk from 'monk';
import CONFIG from '../../config';

const db = monk(CONFIG.mongodb.url);
const locations = db.get('locations');

getLocations.operation = 'READ';
export function getLocations(teamId) {
  return locations.find({ team_id: teamId });
}

getLocation.operation = 'READ';
getLocation.byId = true;
export function getLocation(_id) {
  return locations.find({ _id });
}

updateLocation.operation = 'UPDATE';
// updateLocation.invalidates = ['getLocations'];
export function updateLocation(location) {
  const { _id } = location;
  return locations.update({ _id }, location, {
    upsert: true
  });
}

addLocation.operation = 'CREATE';
// addLocation.invalidates = ['getLocations'];
export function addLocation(location) {
  return locations.insert(location);
}

removeLocation.operation = 'DELETE';
// removeLocation.invalidates = ['getLocations'];
export function removeLocation(_id) {
  return locations.remove({ _id });
}
