import request from 'request';
import logger from '../util/logger';

export function sendResponse(responseURL, JSONmessage) {
  const postOptions = {
    uri: responseURL,
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    json: JSONmessage
  };

  request(postOptions, (error, response) => {
    if (error) {
      logger.info(response);
      return;
    }
    logger.info('Message sent.', JSONmessage);
  });
}
