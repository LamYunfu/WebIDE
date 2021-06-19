export type LastCommitDevice =
  | {
    timeMs: number;
    device: string;
  }
  | undefined;
import { injectable } from "inversify";
//存储一些烧写时需要用到的数据
@injectable()
export class LdcData {
  private _uuid: string = "";
  private _serverType: string = "tinylink_platform_1";
  private _loginType: string = "queue";
  private _serverTimeout: string = "";
  private _waitingIds: string[] = [];
  private _projectNames: string[] = [];
  private _clientIds: string[] = [];
  private _ports: string[] = [];
  private _ldcState: string = "n"; // "n"： 未连接,"y":连接,"i"连接中
  private _pid: string = "26";
  private _lastCommitDevice: LastCommitDevice | undefined;
  private _authorization: string | undefined;

  constructor() {
    this.uuid = this.generate16ByteNumber();
  }

  isValid(): boolean {
    return (
      this._uuid != "" &&
      this._serverType != "" &&
      this._loginType != "" &&
      this._serverTimeout != "" &&
      this._pid != ""
    );
  }
  private generate16ByteNumber(): string {
    return (
      Math.random()
        .toString()
        .substring(3, 11) +
      Math.random()
        .toString()
        .substring(3, 11)
    );
  }
  generateWaitingID() {
    return this.generate16ByteNumber();
  }
  get pid(): string {
    return this._pid;
  }
  set pid(x: string) {
    this._pid = x;
  }
  get ports(): string[] {
    return this._ports;
  }
  set ports(x: string[]) {
    this._ports = x;
  }
  get clientIds(): string[] {
    return this._clientIds;
  }
  set clientIds(x: string[]) {
    this._clientIds = x;
  }
  get projectNames(): string[] {
    return this._projectNames;
  }
  set projectNames(x: string[]) {
    this._projectNames = x;
  }
  get uuid(): string {
    console.log("uuid :" + this._uuid);
    return this._uuid;
  }
  set uuid(x: string) {
    this._uuid = x;
  }
  get ldcState(): string {
    return this._ldcState;
  }
  set ldcState(x: string) {
    this._ldcState = x;
  }
  get waitingIds(): string[] {
    return this._waitingIds;
  }
  set waitingIds(x: string[]) {
    this._waitingIds = x;
  }
  get serverType(): string {
    return this._serverType;
  }

  set serverType(x: string) {
    this._serverType = x;
  }

  get serverTimeout(): string {
    return this._serverTimeout;
  }
  set serverTimeout(x: string) {
    this._serverTimeout = x;
  }
  get loginType(): string {
    return this._loginType;
  }
  set loginType(x: string) {
    this._loginType = x;
  }
  get lastCommitDevice(): LastCommitDevice {
    return this._lastCommitDevice;
  }
  set lastCommitDevice(x: LastCommitDevice) {
    this._lastCommitDevice = x;
  }
  get Authorization(){
    return this._authorization!
  }
  set Authorization(token :string){
     this._authorization=token;
  }
}
