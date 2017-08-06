const logger = require('./lib/logger');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const { getTeams } = require('./lib/db');
const { startBot } = require('./lib/bots');

const index = require('./routes/index');
const auth = require('./routes/api/auth');
const events = require('./routes/api/events');
const commands = require('./routes/api/commands');
const actions = require('./routes/api/actions');

getTeams().then(teams =>
  teams.forEach(team => {
    startBot(team.id);
  })
);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(
  morgan(':method :url :status :response-time ms', {
    stream: logger.stream,
    skip: req => /\.(\w)+$/.test(req.url.split('?')[0])
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api/auth', auth);
app.use('/api/events', events);
app.use('/api/commands', commands);
app.use('/api/actions', actions);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: '🚨 Error',
    message: err.status,
    error: err
  });
});

app.listen(8080, () => {
  logger.info('Listening on port 8080...');
});

module.exports = app;
