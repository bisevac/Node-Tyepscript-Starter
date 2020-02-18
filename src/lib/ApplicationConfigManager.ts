import { $log } from '@tsed/logger';
import * as fs from 'fs';
import * as jsYaml from 'js-yaml';
import * as path from 'path';
import { IApplicationConfig } from 'src/interface/IApplicationConfig';

export class ApplicationConfigManager {
  public static config: IApplicationConfig = {
    db : null,
    server : null,
  };

  public static envPath: string;

  public static loadConfig ( env: string ): IApplicationConfig {
    if ( !env || !env.length ) throw new Error( 'Environment could not validate' );

    let p: string = null;

    if ( process.env.NODE_ENV === 'local' ) {
      p = path.resolve( __dirname, '../../environment/local.yml' );
    } else if ( process.env.NODE_ENV === 'dev' ) {
      p = path.resolve( __dirname, '../../environment/dev.yml' );
    } else if ( process.env.NODE_ENV === 'prod' ) {
      p = path.resolve( __dirname, '../../environment/prod.yml' );
    } else {
      throw new Error( 'Environment not acceptable!' );
    }

    ApplicationConfigManager.config = jsYaml.safeLoad( fs.readFileSync( p, 'utf8' ) );

    return ApplicationConfigManager.config;
  }

  public static getConfig ( configName?: string ) {
    // tslint:disable-next-line: no-unused-expression
    if ( configName ) return ApplicationConfigManager.config[configName];

    return ApplicationConfigManager.config;
  }

  public static getDBConfig () {
    return ApplicationConfigManager.config.db;
  }

  public static getServerConfig () {
    return ApplicationConfigManager.config.server;
  }

}
