import { Service } from '@tsed/di';
import { ConnectionConfig, createPool, escape, format, Pool, PoolConfig, PoolConnection } from 'mysql';
import { ApplicationConfigManager } from './../lib/ApplicationConfigManager';
import { LoggerFactory } from './../lib/Logger';

@Service()
export class MysqlConnection {
  public format = format;
  public escape = escape;

  private logger = LoggerFactory.getLogger( '[MYSQL]' );
  private mySQLConfig: ConnectionConfig;
  private pool: Pool;

  private defaultMySQLPoolConfig: PoolConfig = {
    connectionLimit: 10,
  };

  private defaultMySQLConfig: ConnectionConfig = {
    charset: 'UTF8_GENERAL_CI',
    multipleStatements: true,
    connectTimeout:20000,
    flags: '-FOUND_ROWS',
  };

  /**
   * Creates an instance of MysqlConnection.
   * @memberof MysqlConnection
   * @usage Singleton
   */
  constructor () {
    const config: ConnectionConfig = ApplicationConfigManager.getDBConfig().mysql;
    this.mySQLConfig = Object.assign( {}, this.defaultMySQLConfig, this.defaultMySQLPoolConfig, config );

    this.connect();
    return this;
  }

  public run ( query: string, values?: any ): Promise<any> {
    return new Promise( async ( resolve, reject ) => {
      const connection: PoolConnection = await this.getConnection();
      connection.query( query, values, ( err, result ) => {
        connection.release();

        if ( err ) {
          return reject( err );
        }

        return resolve( result );
      } );
    } );
  }

  /**
   * @template T
   * @param {string} name
   * @param {any[]} args
   * @returns {Promise<T>}
   * @memberof MysqlConnection
   * @desc Call Stored Procedure
   */
  public call <T> ( name: string, args: any[] ): Promise<T> {
    let sp = `CALL ${name}(`;

    const point = new Array( args.length );
    point.fill( '?' );

    sp += point.join( ',' );
    sp += ');';

    return this.run( sp, args );
  }

  private async connect (): Promise<boolean> {
    await this.createConnectionPool();

    return true;
  }

  private getConnection (): Promise<PoolConnection> {
    return new Promise( ( resolve, reject ) => {
      if ( this.pool ) {
        this.pool.getConnection( ( err, connection ) => {
          if ( err ) return reject( err );
          return resolve( connection );
        } );
      } else {
        return reject( new Error( 'Mysql has not any connection.' ) );
      }
    } );
  }

  private createConnectionPool (): boolean {
    this.pool = createPool( this.mySQLConfig );

    this.pool.on( 'connection', ( connection ) => {
      this.logger.info( 'Connected [MYSQL]', this.mySQLConfig );
      connection.query( 'SET SESSION auto_increment_increment=1' );
    } );

    return true;
  }
}
