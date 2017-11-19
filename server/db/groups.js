import monk from 'monk';
import CONFIG from '../../config';

const db = monk(CONFIG.mongodb.url);
const groups = db.get('groups', { castIds: false });

getGroups.operation = 'READ';
export function getGroups(teamId) {
  return groups.find({ team_id: teamId });
}

getGroup.operation = 'READ';
getGroup.byId = true;
export function getGroup(_id) {
  return groups.find({ _id });
}

updateGroup.operation = 'CREATE';
// updateGroup.invalidates = ['getGroups'];
export function updateGroup(group) {
  const { _id } = group;
  return groups.update({ _id }, group, {
    upsert: true
  });
}

removeGroup.operation = 'DELETE';
// removeGroup.invalidates = ['getGroups'];
export function removeGroup(_id) {
  return groups.remove({ _id });
}
