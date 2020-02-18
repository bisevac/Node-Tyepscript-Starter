import { configure, getLogger, Logger } from 'log4js';
import { resolve } from 'path';

export class LoggerFactory {

  /**
   * @static
   * @param {string} category
   * @returns {Logger}
   * @memberof LoggerFactory
   * @desc Build logger for services and controllers
   */
  static getLogger ( category: string ): Logger {
    const logger = getLogger( category );

    const everythingPath: string = resolve( __dirname, './../../logs/all.log' );
    const errorPath: string = resolve( __dirname, './../../logs/errors.log' );

    configure( {
      appenders: {
        out: { type: 'stdout', layout: { type: 'coloured' } },
        everything: { type: 'dateFile', compress: true, pattern: '.yyyy-MM-dd', filename: everythingPath },
        emergencies: { type: 'dateFile', compress: true, pattern: '.yyyy-MM-dd', filename: errorPath },
        'just-errors': { type: 'logLevelFilter', appender: 'emergencies', level: 'error' },
      },
      categories: {
        default: { appenders: ['just-errors', 'everything', 'out'], level: 'debug' },
      },
    } );

    logger.level = 'debug';

    return logger;
  }
}

export const $log = LoggerFactory.getLogger( '[SERVER]' );
