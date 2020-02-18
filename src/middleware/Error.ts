import { Err, IMiddlewareError, MiddlewareError, Next, Request, Response } from '@tsed/common';
import { NextFunction as ExpressNext, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Exception } from 'ts-httpexceptions';
import { HttpStatusCode } from '../enum/HttpStatusCode';
import { IAPIResponseErrorBase } from '../interface/IAPIResponseBase';
import { ApiException } from '../lib/ApiCall';
import { LoggerFactory } from '../lib/Logger';
import { MysqlConnection } from './../service/MysqlConnection';

@MiddlewareError()
export class GlobalErrorHandler implements IMiddlewareError {
  public readonly prefix = '[MiddlewareError]';
  private logger = LoggerFactory.getLogger( this.prefix );

  constructor ( private connection: MysqlConnection ) {
  }

  /**
   * @param {(( IAPIResponseErrorBase | Error ))} error
   * @param {ExpressRequest} request
   * @param {ExpressResponse} response
   * @param {ExpressNext} next
   * @returns {void}
   * @memberof GlobalErrorHandler
   */
  use (
    @Err() error: ( IAPIResponseErrorBase | Error ),
    @Request() request: ExpressRequest,
    @Response() response: ExpressResponse,
    @Next() next: ExpressNext,
  ): void {
    this.logger.error( error );
    this.logger.error( '[Request Body]', request.body );

    if ( error instanceof ApiException ) {
      response.json( error.toJSON() );
      return next();
    }

    /**
     * Save Error Database
     * If Unhandle Error
     */
    this.connection.call<any>( 'addErrorLog', [request.originalUrl, JSON.stringify( error, Object.getOwnPropertyNames( error ) ), JSON.stringify( request.body || null )] )
    .catch( err => this.logger.error( err ) );

    if ( error instanceof Exception ) {
      response.json( new ApiException( error.status, error.message ).toJSON() );
      return next();
    }

    response.json( new ApiException( HttpStatusCode.INTERNAL_SERVER_ERROR, 'An Error Exception' ).toJSON() );
    return next();
  }
}
