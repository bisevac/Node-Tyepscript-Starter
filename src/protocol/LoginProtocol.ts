import { BodyParams, Req, Res } from '@tsed/common';
import { OnVerify, Protocol } from '@tsed/passport';
import { compare } from 'bcrypt';
import { CookieOptions } from 'express';
import { sign, SignOptions } from 'jsonwebtoken';
import { IStrategyOptions, Strategy } from 'passport-local';
import { IJWTConfig } from 'src/interface/IApplicationConfig';
import { HttpStatusCode } from './../enum/HttpStatusCode';
import { IAuthPayload, ILoginCredentials } from './../interface/IAuth';
import { ApiException } from './../lib/ApiCall';
import { ApplicationConfigManager } from './../lib/ApplicationConfigManager';
import { UserService } from './../service/UserService';

@Protocol<IStrategyOptions>( {
  name : 'login',
  useStrategy : Strategy,
  settings : {
    usernameField : 'email',
    passwordField : 'password',
  },
} )
export class LoginLocalProtocol implements OnVerify {

  private jwtConfig: IJWTConfig = ApplicationConfigManager.getConfig( 'jwt' ) as IJWTConfig;

  constructor ( private usersService: UserService ) {
  }

  async $onVerify ( @Req() request: Req, @BodyParams() credentials: ILoginCredentials, @Res() res: Res ) {
    const { email, password } = credentials;

    const user = await this.usersService.findOne( { email, isDeleted:false } );
    if ( !user ) throw new ApiException( HttpStatusCode.BAD_REQUEST, 'Email not found' );

    const passwordCompared = await compare( password, user.password );
    if ( !passwordCompared  ) throw new ApiException( HttpStatusCode.BAD_REQUEST, 'Wrong password' );

    const options: SignOptions = {
      issuer    : this.jwtConfig.issuer,
      audience  : this.jwtConfig.audience,
      expiresIn : this.jwtConfig.expiresIn,
    };

    const payload: IAuthPayload =  {
      id      : user.id,
      email   : user.email,
      name    : user.name,
      surname : user.surname,
    };

    const token = sign( payload, this.jwtConfig.secret, options );

    const cookieOptions: CookieOptions = {
      maxAge: 1000 * 60 * 15,
      httpOnly: true,
    };

    res.cookie( 'access_token', token, cookieOptions );

    return {
      ...user,
      token,
    };
  }
}
