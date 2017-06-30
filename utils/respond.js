var request = require('request');

module.exports = (responseURL, JSONmessage) => {
  const postOptions = {
    uri: responseURL,
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    json: JSONmessage
  };

  request(postOptions, (error, response, body) => {
    if (error) {
      // TODO: Handle errors.
    }
  });
}
