import { injectable } from "inversify";
@injectable()
export class UserInfo {
  private _username: string = "";
  private _passwd: string = "";
  private _tinyname: string = "";
  private _cookie: string = "";
  isValid(): boolean {
    return (
      this._username != "" &&
      this.passwd != "" &&
      this._tinyname != "" &&
      this.cookie != ""
    );
  }
  get username(): string {
    return this._username;
  }
  set username(x: string) {
    this._username = x;
  }
  get passwd(): string {
    return this._passwd;
  }
  set passwd(x: string) {
    this._passwd = x;
  }

  get tinyname(): string {
    return this._tinyname;
  }
  set tinyname(x: string) {
    this._tinyname = x;
  }

  get cookie(): string {
    return this._cookie;
  }
  set cookie(x: string) {
    this._cookie = x;
  }
}
