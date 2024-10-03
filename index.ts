import type { LoggerName as LoggerType } from './loggers.type';

import Logger from './index.logger';
import loggerNames from './loggers.names';
import FileLogger from './file.logger';

export {
    loggerNames,
    LoggerType,
    FileLogger
};

export default Logger;