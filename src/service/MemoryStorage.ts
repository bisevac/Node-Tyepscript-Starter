import { Service } from '@tsed/common';

@Service()
export class MemoryStorage {

  private states: Map<string, string> = new Map<string, string>();

  /**
   * @template T
   * @param {string} key
   * @returns {T}
   * @memberof MemoryStorage
   * Return the value stored.
   */
  public get<T> ( key: string ): T {
    const value = this.states.get( key );
    if ( !value ) return null;

    return JSON.parse( value );
  }

  /**
   * @param {string} key
   * @param {*} value
   * @returns {boolean}
   * @memberof MemoryStorage
   * Serialize value and store it.
   */
  public set ( key: string, value: any ): boolean {
    this.states.set( key, JSON.stringify( value ) );

    return true;
  }
}
