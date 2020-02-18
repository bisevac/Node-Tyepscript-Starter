
import { HttpStatusCode } from './../enum/HttpStatusCode';
import { ApiException } from './../lib/ApiCall';
import { BasePaginationDTO } from './../objects/DataTransferObject/BaseDTO';
import { MysqlConnection } from './MysqlConnection';

export class BaseService<T> {
  protected connection: MysqlConnection;
  protected table: string;

  constructor ( con: MysqlConnection ) {
    this.connection = con;
  }

  public async findOne ( filters: T, select?: string ): Promise<T> {
    if ( !filters ) throw new ApiException( HttpStatusCode.BAD_REQUEST, 'Not have Filters' );

    const query = this.filterQueryBuilder( filters );
    const r = ( await this.connection.run( `SELECT ${select ? select : '*'} FROM ${this.table} WHERE ${query.keys};`, query.values ) )[0];

    return r as T;
  }

  public async find ( filters?: T, select?: string ): Promise<T[]> {
    let queryString = `SELECT ${select ? select : '*'} FROM ${this.table} `;

    if ( filters && Object.keys( filters ).length > 0 ) {
      const query = this.filterQueryBuilder( filters );
      queryString += this.connection.format( ` WHERE ${query.keys}`, query.values );
    }

    const r = await this.connection.run( `${queryString};` );

    return r as T[];
  }

  public async findPaginated ( q: BasePaginationDTO<T>, select?: string ): Promise<T[]> {
    let queryString = `SELECT ${select ? select : '*'} FROM ${this.table} `;

    if ( q.filters && Object.keys( q.filters ).length > 0 ) {
      const query = this.filterQueryBuilder( q.filters );
      queryString += this.connection.format( ` WHERE ${query.keys}`, query.values );
    }

    if ( q.limit ) {
      queryString += this.connection.format( ' LIMIT ?', [q.limit] );
    }

    if ( q.page && q.page !== 1 ) {
      const offset = ( q.page - 1 ) * q.limit;
      queryString += this.connection.format( ' OFFSET ?',  [offset] );
    }

    const r = await this.connection.run( `${queryString};` );

    return r as T[];
  }

  public async create ( data: T, select?: string ): Promise<T> {
    if ( !data ) throw new ApiException( HttpStatusCode.BAD_REQUEST, 'Not have data for create' );

    const keys = Object.keys( data );
    const values = Object.values( data );
    const point: string[] = new Array( keys.length );
    point.fill( '?' );

    const r = ( await this.connection.run( `INSERT INTO ${this.table} (${keys.join( ',' )}) VALUES (${point.join( ',' )});`, values ) );
    const inserted = await this.findById( r.insertId, select );

    return inserted as T;
  }

  public async update ( data: T, filters: T ): Promise<true> {
    if ( !data || !filters ) throw new ApiException( HttpStatusCode.BAD_REQUEST, 'Not have Filters or update data' );

    const keys = Object.keys( data ).map( k => `${escape( k )} = ?` );
    const values = Object.values( data );

    const query = this.filterQueryBuilder( filters );
    await this.connection.run( `UPDATE ${this.table} SET ${keys.join( ',' )} WHERE ${query.keys};`, values.concat( query.values ) );

    return true;
  }

  public async deleteById ( id: number ): Promise<boolean> {
    if ( !id || isNaN( id ) ) throw new ApiException( HttpStatusCode.BAD_REQUEST, 'Not have Id' );

    await this.connection.run( `DELETE FROM ${this.table} WHERE id = ?`, id );

    return true;
  }

  public async setIsDeletedById ( id: number ): Promise<boolean> {
    if ( !id || isNaN( id ) ) throw new ApiException( HttpStatusCode.BAD_REQUEST, 'Not have Id' );

    await this.connection.run( `UPDATE ${this.table} SET isDeleted = 1 WHERE id = ? `, id );

    return true;
  }

  public async delete ( filters: T ): Promise<boolean> {
    if ( !filters ) throw new ApiException( HttpStatusCode.BAD_REQUEST, 'Not have Filters' );
    const query = this.filterQueryBuilder( filters );
    await this.connection.run( `DELETE FROM ${this.table} WHERE ${query.keys}`, query.values );

    return true;
  }

  public async findById ( id: number, select?: string ): Promise<T> {
    if ( !id || isNaN( id ) ) throw new ApiException( HttpStatusCode.BAD_REQUEST, 'Not have Id' );

    const r = ( await this.connection.run( `SELECT ${select ? select : '*'} FROM ${this.table} WHERE id = ?`, id ) )[0];

    return r as T;
  }

  private filterQueryBuilder ( filters ): {values: any[],  keys: string} {
    const filterArray = [];
    const values = Object.keys( filters ).map( ( filter ) => {
      filterArray.push( `${escape( filter )} = ?` );

      return filters[filter];
    } );

    return { values, keys : filterArray.join( ' AND ' ) };
  }
}
