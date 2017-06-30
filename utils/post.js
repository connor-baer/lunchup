var request = require('request');

module.exports = (url, FORMmessage) => {
  const postOptions = {
    url: url,
    method: 'POST',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    form: FORMmessage
  };

  request(postOptions, (error, response, body) => {
    if (error) {
      // TODO: Handle errors.
    }
  });
};
