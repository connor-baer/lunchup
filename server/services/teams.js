import { isEmpty } from 'lodash';
import DB from '../db';

export async function getTeams() {
  try {
    return await DB.teams.getTeams();
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

export async function addTeam(teamId, team) {
  if (!teamId) {
    throw new Error('Team id not provided.');
  }
  if (isEmpty(team)) {
    throw new Error('Team info not provided.');
  }
  const _id = teamId;
  try {
    return await DB.teams.updateTeam({ ...team, _id });
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
  const _id = teamId;
  const oldTeam = await DB.teams.getTeam(_id);
  const newTeam = { ...oldTeam, team };
  try {
    return await DB.teams.updateTeam(newTeam);
  } catch (e) {
    throw new Error(e);
  }
}
