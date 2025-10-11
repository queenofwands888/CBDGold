import util from 'util';

const LEVELS = ['error', 'warn', 'info', 'debug', 'trace'];
const DEFAULT_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
const levelIndex = Math.max(0, LEVELS.indexOf(DEFAULT_LEVEL));

const safeSerialize = (payload) => {
  if (!payload) return undefined;
  if (payload instanceof Error) {
    return {
      message: payload.message,
      stack: process.env.NODE_ENV === 'development' ? payload.stack : undefined,
      name: payload.name
    };
  }
  if (typeof payload === 'string') return payload;
  return payload;
};

const log = (level, message, meta) => {
  const idx = LEVELS.indexOf(level);
  if (idx === -1 || idx > levelIndex) return;

  const timestamp = new Date().toISOString();
  const entry = {
    level,
    timestamp,
    message,
    ...(meta !== undefined ? { meta: safeSerialize(meta) } : {})
  };

  const line = JSON.stringify(entry);
  switch (level) {
    case 'error':
      console.error(line);
      break;
    case 'warn':
      console.warn(line);
      break;
    default:
      console.log(line);
  }
};

export const logger = {
  error(message, meta) {
    log('error', message, meta);
  },
  warn(message, meta) {
    log('warn', message, meta);
  },
  info(message, meta) {
    log('info', message, meta);
  },
  debug(message, meta) {
    log('debug', message, meta);
  },
  trace(message, meta) {
    log('trace', message, meta);
  },
  format(obj) {
    return util.inspect(obj, { depth: 4, colors: false, breakLength: 120 });
  }
};
