import { isEmpty } from 'lodash';
import DB from '../db';

export async function addTeam(teamId, team) {
  if (!teamId) {
    throw new Error('Team id not provided.');
  }
  if (isEmpty(team)) {
    throw new Error('Team info not provided.');
  }
  try {
    return await DB.teams.addTeam({ ...team, _id: teamId });
  } catch (e) {
    throw new Error(e);
  }
}

export async function updateTeam(teamId, team) {
  if (!teamId) {
    throw new Error('Team id not provided.');
  }
  if (isEmpty(team)) {
    throw new Error('Team info not provided.');
  }
  try {
    return await DB.teams.updateTeam({ ...team, _id: teamId });
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
