import { contains } from './helpers';

describe('contains should', () => {
  const messageText =
    'Bacon ipsum dolor amet t-bone ground round bresaola beef ham hock capicola jowl tongue fatback. Tri-tip prosciutto meatball ground round andouille, sausage swine cupim alcatra corned beef shank tenderloin.'; // eslint-disable-line max-len
  const wordsToMatch = ['bacon', 'sandwich', 'steak'];
  const wordsNotToMatch = ['carrot', 'apple', 'yoghurt'];

  it('return false when no parameters are provided', () => {
    const result = contains();
    expect(result).toBeFalsy();
  });

  it('return false when only message is provided', () => {
    const result = contains(messageText, undefined);
    expect(result).toBeFalsy();
  });

  it('return false when only words are provided', () => {
    const result = contains(undefined, wordsToMatch);
    expect(result).toBeFalsy();
  });

  it('return false when message does not contain words', () => {
    const result = contains(messageText, wordsNotToMatch);
    expect(result).toBeFalsy();
  });

  it('return true when message contains words', () => {
    const result = contains(messageText, wordsToMatch);
    expect(result).toBeTruthy();
  });
});
