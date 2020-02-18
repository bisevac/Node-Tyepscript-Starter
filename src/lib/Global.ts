// tslint:disable: no-namespace
import { IApplicationConfig } from './../interface/IApplicationConfig';

export namespace AppState {
  /**
   * App state inteface
   *
   * @export
   * @interface IState
   */
  export interface IState {
    $config: IApplicationConfig;
    $data: any;
  }

  export const state: IState = {
    $config: {},
    $data:{},
  };
}
