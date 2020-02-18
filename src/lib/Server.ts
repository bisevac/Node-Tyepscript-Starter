import { ServerLoader , ServerSettings } from '@tsed/common';
import '@tsed/passport';
import * as bodyParser from 'body-parser';
import * as compress from 'compression';
import * as cons from 'consolidate';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import * as methodOverride from 'method-override';
import { dirname, resolve } from 'path';
import { GlobalErrorHandler } from './../middleware/Error';
import { UserDAO } from './../objects/DataAccessObject/UserDAO';
import { $log } from './Logger';

const rootDir = dirname( require.main.filename );

/**
 * @export
 * @class Server
 * @extends {ServerLoader}
 * Can be change viewsDir and Statics
 * ServerSettings
 */
@ServerSettings( {
  rootDir,
  statics: {
    '/':resolve( `${rootDir}/../public` ),
  },
  viewsDir:resolve( `${rootDir}/../view` ),
  uploadDir: `${rootDir}/../public/bucket`,
  passport: {
    userInfoModel : UserDAO,
  },
} )
export class Server extends ServerLoader {
  constructor ( settings ) {
    super( settings );
    $log.info( settings );
  }
  /**
   * This method let you configure the express middleware required by your application to works.
   * @returns {Server}
   */
  public $beforeRoutesInit (): void | Promise<any> {
    this
      .use( helmet() )
      .use( cookieParser() )
      .use( compress( {} ) )
      .use( methodOverride() )
      .use( bodyParser.json() )
      .use( bodyParser.urlencoded( {
        extended: true,
      } ) );
  }

  public $beforeInit () {
    this.set( 'views', this.settings.get( 'viewsDir' ) );
    this.engine( 'ejs', cons.ejs );
  }

  public $onReady () {
    $log.info( 'Server Ready' );
  }

  public $afterListen () {
    $log.info( 'Server Listening' );
  }

  public $afterRoutesInit () {
    this.use( GlobalErrorHandler );
  }
}
