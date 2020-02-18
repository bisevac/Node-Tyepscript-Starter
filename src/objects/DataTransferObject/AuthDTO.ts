import { ModelStrict, Property, Required } from '@tsed/common';

@ModelStrict( true )
export class LoginRequestDTO {
  @Required()
  @Property()
  email: string;

  @Required()
  @Property()
  password: string;
}
