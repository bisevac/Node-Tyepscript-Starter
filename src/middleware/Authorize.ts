import { AuthenticatedMiddleware, EndpointInfo, EndpointMetadata, IMiddleware, Next, OverrideMiddleware, Req, Request, Response } from '@tsed/common';
import { NextFunction, Response as ExpressResponse } from 'express';
import { verify, VerifyOptions } from 'jsonwebtoken';
import { HttpStatusCode } from '../enum/HttpStatusCode';
import { IJWTConfig } from './../interface/IApplicationConfig';
import { IAuthPayload } from './../interface/IAuth';
import { ApiException } from './../lib/ApiCall';
import { ApplicationConfigManager } from './../lib/ApplicationConfigManager';
import { LoggerFactory } from './../lib/Logger';
import { UserDAO } from './../objects/DataAccessObject/UserDAO';
import { UserService } from './../service/UserService';

@OverrideMiddleware( AuthenticatedMiddleware )
export class Authorize implements IMiddleware {
  private prefix: string = '[AuthenticatedMiddleware]';
  private jwtConfig: IJWTConfig = ApplicationConfigManager.getConfig( 'jwt' ) as IJWTConfig;

  private logger = LoggerFactory.getLogger( this.prefix );
  constructor ( private userService: UserService ) {
  }

  public async use ( @EndpointInfo() endpoint: EndpointMetadata,
                     @Request() request: Req,
                     @Response() response: ExpressResponse,
                     @Next() next: NextFunction ) {
    const { Required, Admin } = endpoint.get( AuthenticatedMiddleware ) || {};
    const isRequired: boolean = Required !== false;

    try {
      const access_token: string = request.cookies.access_token;

      if ( ( !request.cookies || !access_token ) && isRequired ) {
        response.json( new ApiException( HttpStatusCode.UNAUTHORIZED, 'Unauthorized' ).toJSON() );
        return;
      }

      const options: VerifyOptions = {
        issuer    : this.jwtConfig.issuer,
        audience  : this.jwtConfig.audience,
      };

      const payload: IAuthPayload = verify( access_token, this.jwtConfig.secret, options ) as IAuthPayload;

      if ( !payload && isRequired ) {
        response.json( new ApiException( HttpStatusCode.UNAUTHORIZED, 'Unauthorized' ).toJSON() );
        return;
      }

      const user: UserDAO = await this.userService.findById( payload.id );
      const userIsValid = ( user && !user.isDeleted );

      if ( !userIsValid && isRequired ) throw new ApiException( HttpStatusCode.UNAUTHORIZED, 'Unauthorized' );

      request['__user'] = userIsValid ? ( user as UserDAO ) : null;

      return next();
    } catch ( error ) {
      this.logger.error( error );
      if ( isRequired ) throw new ApiException( HttpStatusCode.UNAUTHORIZED, 'Unauthorized' );
      request['__user'] = null;

      return next();
    }
  }
}
