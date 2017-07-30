const winston = require('winston');

winston.add(winston.transports.File, { filename: 'node.log' });

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const { getTeams } = require('./lib/db');
const lunchup = require('./lib/lunchup');

const index = require('./routes/index');
const auth = require('./routes/api/auth');
const events = require('./routes/api/events');
const commands = require('./routes/api/commands');
const actions = require('./routes/api/actions');

const teams = getTeams();
teams.forEach(team => {
  const botToken = team.sys.bot.bot_access_token;
  lunchup(botToken);
});

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

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
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(8080, () => {
  winston.info('Listening on port 8080...');
});

module.exports = app;
