import { $log, BodyParams, Controller, Get, PathParams, Post, Render } from '@tsed/common';
import { LoggerFactory } from './..//lib/Logger';
import { ApiResponse } from './../lib/ApiCall';
import { HomeService } from './../service/HomeService';

@Controller( '/home' )
export class HomeController {
  private prefix = '[AUTH]';
  private logger = LoggerFactory.getLogger( this.prefix );

  constructor ( private homeService: HomeService ) {
    this.logger.info( 'Home Controller Loadded' );
  }

  @Get( '/' )
  @Render( 'index.ejs' )
  public homePage () {
    return { desc:'Home Page' };
  }

  @Post( '/set' )
    public set ( @BodyParams() body ): ApiResponse<null> {
    const r = this.homeService.set( body.key, body.value );

    return new ApiResponse( r );
  }

  @Get( '/get/:key' )
  public get ( @PathParams( 'key' ) key ): ApiResponse<any> {
    const value = this.homeService.get( key );

    return new ApiResponse( value );
  }
}
