import { HttpStatusCode } from './../enum/HttpStatusCode';
import { IAPIResponseBase, IAPIResponseErrorBase } from './../interface/IAPIResponseBase';

export class ApiException extends Error {
/**
 * Exception base name
 * @type {string}
 */
  public name: string = 'HTTP_EXCEPTION';
/**
 * Message of the exception
 */
  public message: string;
/**
 * Exception type
 * @type {string}
 */
  public type: string = 'HTTP_EXCEPTION';
/**
 * Stack calling
 */
  public stack: string;
  public innerException: Error;
/**
 * HTTP Code Status
 */
  public status: number;

  constructor ( status: HttpStatusCode, message?: string ) {
    super( message );

    this.status = status;
    this.message = message || '';
  }

  /**
   * Object to raw json convert
   *
   * @returns {IAPIResponseErrorBase}
   * @memberof ApiException
   */
  toJSON (): IAPIResponseErrorBase {
    return {
      err: true,
      msg: this.message,
      code: this.status,
      data: null,
    };
  }
}

export class ApiResponse<T> implements IAPIResponseBase<T> {
  public err: boolean = false;
  public msg: string = '';
  public code: number = HttpStatusCode.OK;
  public data: T = null;

  constructor ( data: T, msg?: string ) {
    this.data = data;
    this.msg =  msg;
  }

  toJSON (): IAPIResponseBase<T> {
    return {
      code: this.code,
      msg: this.msg,
      err: this.err,
      data: this.data,
    };
  }
}
