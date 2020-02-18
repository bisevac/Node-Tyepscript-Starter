import { Authenticated, BodyParams, Controller, Delete, Get, PathParams, Post, Put, Render, Request, Required } from '@tsed/common';
import { Authenticate, Authorize } from '@tsed/passport';
import { Account } from './../filter/FilterRegistry';
import { ApiResponse } from './../lib/ApiCall';
import { $log, LoggerFactory } from './../lib/Logger';
import { UserDAO } from './../objects/DataAccessObject/UserDAO';
import { BasePaginationDTO } from './../objects/DataTransferObject/BaseDTO';
import { UserCreateRequestDTO, UserUpdateRequestDTO } from './../objects/DataTransferObject/UserDTO';
import { UserService } from './../service/UserService';

@Controller( '/user' )
export class UserController {
  private prefix = '[AUTH]';
  private logger = LoggerFactory.getLogger( this.prefix );

  constructor ( private userService: UserService ) {
    this.logger.info( 'User Controller Loadded' );
  }

  @Get( '/list' )
  @Authenticated()
  @Render( 'user/list.ejs' )
  public async renderUserList ( @Request() req, @Account() user: UserDAO ) {
    $log.info( user );
    const users = await this.userService.find();

    return { users };
  }

  @Get( '/login' )
  @Render( 'user/login.ejs' )
  public async renderRegisterPage () {
    return {};
  }

  @Get( '/:id' )
  public async find ( @PathParams( 'id' ) @Required() id ): Promise<ApiResponse<UserDAO>> {
    const r = await this.userService.findById( id );

    return new ApiResponse( r );
  }

  @Post( '/register' )
  public async create ( @BodyParams() body: UserCreateRequestDTO ): Promise<ApiResponse<UserDAO>> {
    const r = await this.userService.register( body );

    return new ApiResponse( r );
  }

  @Post( '/list' )
  public async list ( @BodyParams() query: BasePaginationDTO<UserDAO> ): Promise<ApiResponse<UserDAO[]>> {
    const r = await this.userService.findPaginated( query );

    return new ApiResponse( r );
  }

  @Delete( '/:id' )
  public async delete ( @PathParams( 'id' ) id ): Promise<ApiResponse<boolean>> {
    const r = await this.userService.deleteById( id );

    return new ApiResponse( r );
  }

  @Delete( '/set/:id' )
  public async setIsDeleted ( @PathParams( 'id' ) id ): Promise<ApiResponse<boolean>> {
    const r = await this.userService.setIsDeletedById( id );

    return new ApiResponse( r );
  }

  @Put( '/update' )
  public async update ( @BodyParams() body: UserUpdateRequestDTO ): Promise<ApiResponse<boolean>> {
    const r = await this.userService.update( body, { id:body.id } );

    return new ApiResponse( r );
  }
}
