import { updateUsers, groupUsers, matchUsers, notifyUsers } from './match';
import { users } from './data.json';

describe('updateUsers should', () => {
  it('return null when no users are provided', () => {
    const result = updateUsers();
    expect(result).toBeFalsy();
  });

  it('return false when only message is provided', () => {
    const result = updateUsers(messageText, undefined);
    expect(result).toBeFalsy();
  });

  it('return false when only words are provided', () => {
    const result = updateUsers(undefined, wordsToMatch);
    expect(result).toBeFalsy();
  });

  it('return false when message does not contain words', () => {
    const result = updateUsers(messageText, wordsNotToMatch);
    expect(result).toBeFalsy();
  });

  it('return true when message updateUsers words', () => {
    const result = updateUsers(messageText, wordsToMatch);
    expect(result).toBeTruthy();
  });
});
