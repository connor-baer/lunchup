const winston = require('winston');

winston.add(winston.transports.File, { filename: 'node.log' });
winston.stream = {
  write(message, encoding) {
    winston.info(message);
  }
};

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const { getTeams } = require('./lib/db');
const { initSlack } = require('./lib/slack');

const index = require('./routes/index');
const auth = require('./routes/api/auth');
const events = require('./routes/api/events');
const commands = require('./routes/api/commands');
const actions = require('./routes/api/actions');

getTeams().then(teams => teams.forEach(team => {
  const botToken = team.sys.bot.bot_access_token;
  const apiToken = team.sys.access_token;
  initSlack(botToken, apiToken);
}));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(
  morgan(
    ':method :url :status :response-time ms',
    {
      stream: winston.stream,
      skip: req => /\.(\w)+$/.test(req.url.split('?')[0])
    }
  )
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
