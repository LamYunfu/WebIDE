export class LdcData {
  private _uuid: string = "";
  private _deviceType: string = "";
  private _loginType: string = "";
  private _timeout: string = "";
  constructor() {
    this.uuid =
      Math.random()
        .toString()
        .substring(3, 11) +
      Math.random()
        .toString()
        .substring(3, 11);
  }
  isValid(): boolean {
    return (
      this._uuid != "" &&
      this._deviceType != "" &&
      this._loginType != "" &&
      this._timeout != ""
    );
  }
  get uuid(): string {
    return this._uuid;
  }
  set uuid(x: string) {
    this._uuid = x;
  }
  get deviceType(): string {
    return this._deviceType;
  }
  set deviceType(x: string) {
    this._deviceType = x;
  }

  get timeout(): string {
    return this._timeout;
  }
  set timeout(x: string) {
    this._timeout = x;
  }
}
