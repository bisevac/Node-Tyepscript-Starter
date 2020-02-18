import { HttpStatusCode } from './../enum/HttpStatusCode';

export interface IAPIResponseBase<T> {
  err: boolean;
  msg: string;
  code: HttpStatusCode;
  data: T | any;
}

export interface IAPIResponseErrorBase extends IAPIResponseBase<null> {
  data: null;
}
