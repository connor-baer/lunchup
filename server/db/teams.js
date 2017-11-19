import monk from 'monk';
import { addMongoDbId } from '../util/addMongoDbId';
import CONFIG from '../../config';

const db = monk(CONFIG.mongodb.url);

const teams = db.get('teams');

getTeams.operation = 'READ';
export function getTeams() {
  return teams.find();
}

getTeam.operation = 'READ';
getTeam.byId = true;
export function getTeam(_id) {
  return teams.find({ _id });
}

updateTeam.operation = 'UPDATE';
// updateTeam.invalidates = ['getTeams'];
export function updateTeam(team) {
  const teamWithId = addMongoDbId(team);
  return teams.update({ _id: teamWithId._id }, teamWithId, {
    upsert: true
  });
}

addTeam.operation = 'CREATE';
// addTeam.invalidates = ['getTeams'];
export function addTeam(team) {
  const teamWithId = addMongoDbId(team);
  return teams.insert(teamWithId);
}

deleteTeam.operation = 'DELETE';
// deleteTeam.invalidates = ['getTeams'];
export function deleteTeam(_id) {
  return teams.remove({ _id });
}
