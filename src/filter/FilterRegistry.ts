import { Filter, IFilter, ParseService, UseFilter } from '@tsed/common';
import { Request, Response } from 'express';

@Filter()
class HeaderAuthorizeFilter implements IFilter {
  constructor ( private parseService: ParseService ) {}

  transform ( expression: string, request: Request, response: Response ) {
    return this.parseService.eval( expression, request['__user'] );
  }
}

function account ( expression?: string|any, useType?: any ): any {
  return UseFilter( HeaderAuthorizeFilter, { expression, useType } );
}

export {
  account as Account,
};
