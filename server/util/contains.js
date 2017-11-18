import { includes } from 'lodash';

export function contains(messageText = '', wordsToMatch = []) {
  const text = messageText.toLowerCase();
  return wordsToMatch.some(wordToMatch => {
    const word = wordToMatch.toLowerCase();
    return includes(text, word);
  });
}
