import { isEmpty } from 'lodash';
import DB from '../db';

export async function addTeam(teamId, teamInfo) {
  if (!teamId) {
    throw new Error('Team id not provided.');
  }
  if (isEmpty(teamInfo)) {
    throw new Error('Team info not provided.');
  }
  try {
    return await DB.teams.addTeam({ ...teamInfo, _id: teamId });
  } catch (e) {
    throw new Error(e);
  }
}

export async function updateTeam(teamId, teamInfo) {
  if (!teamId) {
    throw new Error('Team id not provided.');
  }
  if (isEmpty(teamInfo)) {
    throw new Error('Team info not provided.');
  }
  try {
    return await DB.teams.updateTeam({ ...teamInfo, _id: teamId });
  } catch (e) {
    throw new Error(e);
  }
}

export async function getTeam(teamId) {
  if (!teamId) {
    throw new Error('Team id not provided.');
  }
  try {
    return await DB.teams.getTeam(teamId);
  } catch (e) {
    throw new Error(e);
  }
}

export async function getTeams() {
  try {
    return await DB.teams.getTeams();
  } catch (e) {
    throw new Error(e);
  }
}
