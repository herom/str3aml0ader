const LOG_DEFAULT_LEVEL = 'log';
const LOG_LEVELS = ['silly', 'debug', 'info', 'warn', 'error'];
let logEngine = null;
let levelProxy = null;

const testEngine = (engine) => {
  const levelMap = new Map();

  if (typeof engine.log === 'function') {
    levelMap.set(LOG_DEFAULT_LEVEL, LOG_DEFAULT_LEVEL);
  } else {
    return false;
  }

  for (const level of LOG_LEVELS) {
    levelMap.set(level, typeof engine[level] === 'function' ? level : LOG_DEFAULT_LEVEL);
  }

  return levelMap;
};

const _applyLogLevel = (level, args) => {
  return logEngine[levelProxy.get(level)](args);
};

const logger = {
  setLogEngine (engine) {
    const levelMap = testEngine(engine);

    if (levelMap) {
      logEngine = engine;
      levelProxy = levelMap;

      return true;
    }

    return false;
  },

  silly (...args) {
    return _applyLogLevel('silly', args);
  },

  debug (...args) {
    return _applyLogLevel('debug', args);
  },

  info (...args) {
    return _applyLogLevel('info', args);
  },

  log (...args) {
    return _applyLogLevel('log', args);
  },

  warn (...args) {
    return _applyLogLevel('warn', args);
  },

  error (...args) {
    return _applyLogLevel('error', args);
  }
};

logger.setLogEngine(console);

module.exports = logger;