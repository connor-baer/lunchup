import monk from 'monk';
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
  const { _id } = team;
  return teams.update({ _id }, team, {
    upsert: true
  });
}

addTeam.operation = 'CREATE';
// addTeam.invalidates = ['getTeams'];
export function addTeam(team) {
  return teams.insert(team);
}

removeTeam.operation = 'DELETE';
// removeTeam.invalidates = ['getTeams'];
export function removeTeam(_id) {
  return teams.remove({ _id });
}
