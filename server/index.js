import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import logger from './util/logger';

import { getTeams } from './services/db';
import { initSlack } from './services/slack';

import { index } from './routes/index';
import { auth } from './routes/api/auth';
import { events } from './routes/api/events';
import { commands } from './routes/api/commands';
import { actions } from './routes/api/actions';

const port = process.env.PORT || 8080;
const app = express();

getTeams().then(teams =>
  teams.forEach(team => {
    initSlack(team.id);
  })
);

// view engine setup
app.set('views', 'views');
app.set('view engine', 'twig');

app.use(
  morgan(':method :url :status :response-time ms', {
    stream: logger.stream,
    skip: req => /\.(\w)+$/.test(req.url.split('?')[0])
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

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

app.listen(port, () => {
  logger.info(`Listening on port ${port}...`);
});

export { app };
