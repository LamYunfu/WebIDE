export const ControllerConnectionInterface = Symbol("ControllerConnectionInterface");
export interface ControllerConnectionInterface {
  login_and_get_server: (
    uuid: string,
    login_type: string,
    model: string
  ) => Promise<Array<any>>;
}
