import * as GROUPS from './groups';
import { users } from './data.json';

describe('updateUsers', () => {
  it('should return null when no users are provided', () => {
    const result = GROUPS.updateUsers();
    expect(result).toBeFalsy();
  });
});
