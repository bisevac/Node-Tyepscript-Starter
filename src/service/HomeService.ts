import { Service } from '@tsed/common';
import { MemoryStorage } from './MemoryStorage';

@Service()
export class HomeService {

  /**
   * Creates an instance of HomeService.
   * @param {MemoryStorage} memoryStorage
   * @memberof HomeService
   */
  constructor ( private memoryStorage: MemoryStorage ) {

  }

  /**
   * @param {*} key
   * @param {*} value
   * @returns {boolean}
   * @memberof HomeService
   */
  public set ( key: any, value: any ): any {
    this.memoryStorage.set( key, value );

    return true;
  }

  /**
   * @param {*} key
   * @returns {any}
   * @memberof HomeService
   */
  public get ( key: any ): any {
    const r = this.memoryStorage.get( key );

    return r;
  }
}
