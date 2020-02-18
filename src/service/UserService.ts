import { $log, Property, Service } from '@tsed/common';
import { hashSync } from 'bcrypt';
import { LoggerFactory } from './../lib/Logger';
import { UserDAO } from './../objects/DataAccessObject/UserDAO';
import { BaseService } from './BaseService';
import { MemoryStorage } from './MemoryStorage';
import { MysqlConnection } from './MysqlConnection';

@Service()
export class UserService extends BaseService<UserDAO> {
  protected table: string = 'user';
  protected log = LoggerFactory.getLogger( '[User]' );

  constructor ( protected connection: MysqlConnection, private memoryStorage: MemoryStorage ) {
    super( connection );
    this.log.info(  'Finally  ' );
  }

  async register ( data: UserDAO ): Promise<UserDAO> {
    data.password = hashSync( data.password, 10 );
    const user = await this.create( data );

    delete user.password;

    return user;
  }
}
