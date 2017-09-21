import { addTeam, updateTeam, hasTeam, getTeams } from './db';

const teamId = 'T3DSH1HSD4';
const teamInfo = {
  teamId: 'T3DSH1HSD4'
};

describe('addTeam(teamId, teamInfo) should', () => {
  it('resolve when team is added', () => {
    expect.assertions(1);
    return expect(addTeam(teamId, teamInfo)).resolves.toBeTruthy();
  });

  it('reject when teamId is missing', () => {
    expect.assertions(1);
    return expect(addTeam(undefined, teamInfo)).rejects.toEqual(
      'Team id not provided.'
    );
  });

  it('reject when teamInfo is missing', () => {
    expect.assertions(1);
    return expect(addTeam(teamId, {})).rejects.toEqual(
      'Team info not provided.'
    );
  });
});

describe('updateTeam(teamId, teamInfo) should', () => {
  it('resolve when team is updated', () => {
    expect.assertions(1);
    return expect(updateTeam(teamId, teamInfo)).resolves.toBeTruthy();
  });

  it('reject when teamId is missing', () => {
    expect.assertions(1);
    return expect(updateTeam(undefined, teamInfo)).rejects.toEqual(
      'Team id not provided.'
    );
  });

  it('reject when teamInfo is missing', () => {
    expect.assertions(1);
    return expect(updateTeam(teamId, {})).rejects.toEqual(
      'Team info not provided.'
    );
  });
});

describe('hasTeam(teamId, teamInfo) should', () => {
  it('return false when team id not provided', () =>
    expect(hasTeam(undefined)).toBeFalsy());

  it('return true when team exists', () =>
    expect(hasTeam(teamId)).toBeTruthy());

  it('return false when team does not exist', () =>
    expect(hasTeam('T3DSH1JSD4')).toBeFalsy());
});
