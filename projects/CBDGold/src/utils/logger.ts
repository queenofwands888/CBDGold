const isProd = import.meta.env.PROD;
const PREFIX = '[CBDGold]';

type LogArgs = unknown[];

const noop = () => undefined;

const sanitizeArg = (arg: unknown, allowDetails: boolean): unknown => {
  if (arg instanceof Error) {
    if (!allowDetails) {
      return `${arg.name}: ${arg.message}`;
    }
    return arg;
  }

  if (!allowDetails && typeof arg === 'object' && arg !== null) {
    try {
      return JSON.stringify(arg);
    } catch (error) {
      return '[object]';
    }
  }

  return arg;
};

const emit = (level: 'log' | 'info' | 'warn' | 'error' | 'debug', args: LogArgs, allowDetails: boolean) => {
  const consoleMethod = console[level] ?? console.log;
  const payload = args.map(arg => sanitizeArg(arg, allowDetails || !isProd));
  consoleMethod.call(console, PREFIX, ...payload);
};

export const logger = {
  debug: (...args: LogArgs) => {
    if (!isProd) emit('debug', args, false);
  },
  info: (...args: LogArgs) => {
    if (!isProd) emit('info', args, false);
  },
  warn: (...args: LogArgs) => {
    if (!isProd) {
      emit('warn', args, true);
    }
  },
  error: (...args: LogArgs) => {
    emit('error', args, true);
  }
};

export type Logger = typeof logger;
