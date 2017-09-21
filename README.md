# LunchUp

> A Slackbot to match coworkers for blind lunches

* Built on the [Slack Node SDK](https://github.com/slackapi/node-slack-sdk)
* Written in ES2017
* Tests with [Jest](https://facebook.github.io/jest/)

## Getting started

```bash
❯ git clone https://github.com/connor-baer/lunchup.git
❯ npm install
❯ npm start
```

The server is started with the `--inspect` flag by default, so you can [debug Node.js with the Chrome DevTools](https://medium.com/@paul_irish/debugging-node-js-nightlies-with-chrome-devtools-7c4a1b95ae27).


## Testing

### Linting

We use [prettier](https://github.com/prettier/prettier) and [ESLint](http://eslint.org) with the [Airbnb config](https://www.npmjs.com/package/eslint-config-airbnb) to lint our JavaScript. ESLint is configured so that any formatting rules covered by prettier are reported by prettier. Any Airbnb rules covered by prettier are overwritten with the prettier setting.

The project has a linting task with an additional watch mode:

- `test:lint`: runs ESLint on `**/*.js`.
- `test:lint:watch` runs the above lint task in watch mode. Only changed files are linted.

### Fixing

We have three npm tasks for fixing code.

```bash
# Fix JavaScript
❯ npm run fix:prettier
❯ npm run fix:eslint

# Fix all
❯ npm run fix
```

### Testing

We use [Jest](https://facebook.github.io/jest/) to unit test our JavaScript.

The project has a testing task with an additional watch mode:

- `test:unit`: runs Jest on `src/**/*.js`.
- `test:unit:watch` runs the above test task in watch mode. Only changed files are tested.

### Run all

```bash
# Test all
❯ npm run test
```
