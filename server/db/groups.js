import monk from 'monk';
import CONFIG from '../../config';

const db = monk(CONFIG.mongodb.url);
const groups = db.get('groups');

getGroups.operation = 'READ';
export function getGroups(teamId) {
  return groups.find({ team_id: teamId });
}

getGroup.operation = 'READ';
getGroup.byId = true;
export function getGroup(_id) {
  return groups.find({ _id });
}

addGroup.operation = 'CREATE';
// addGroup.invalidates = ['getGroups'];
export function addGroup(group) {
  return groups.insert(group);
}

removeGroup.operation = 'DELETE';
// removeGroup.invalidates = ['getGroups'];
export function removeGroup(_id) {
  return groups.remove({ _id });
}
