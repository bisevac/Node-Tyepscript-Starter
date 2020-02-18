import  { IgnoreProperty, Minimum, ModelStrict, Property, Required } from '@tsed/common';

@ModelStrict( true )
export class UserCreateRequestDTO {
  @Required()
  @Property()
  email: string;

  @Required()
  @Property()
  name: string;

  @Required()
  @Property()
  password: string;

  @Property()
  surname?: string;

  @Property()
  age?: number;
}

export class UserUpdateRequestDTO {
  @Required()
  id: number;

  password: string;
  email?: string;
  name?: string;
  surname?: string;
  age?: number;
}
