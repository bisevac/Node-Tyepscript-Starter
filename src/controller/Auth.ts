import { $log, BodyParams, Controller, Get, PathParams, Post, Render, Req, Res } from '@tsed/common';
import { Authenticate } from '@tsed/passport';
import { ApiResponse } from './../lib/ApiCall';
import { LoggerFactory } from './../lib/Logger';
import { LoginRequestDTO } from './../objects/DataTransferObject/AuthDTO';
import { UserService } from './../service/UserService';

@Controller( '/auth' )
export class AuthController {
  private prefix = '[AUTH]';
  private logger = LoggerFactory.getLogger( this.prefix );

  constructor ( userService: UserService ) {
    this.logger.info( 'Auth Controller Loadded' );
  }

  @Post( '/login' )
  @Authenticate( 'login' )
  public login ( @Req() req, @BodyParams() body: LoginRequestDTO , @Res() res: Res ) {
    const token = req.user.token;

    return new ApiResponse( { token }, 'Login Success' );
  }
}
