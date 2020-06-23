import { EventEmitter } from "events";
import { injectable, decorate } from "inversify";
decorate(injectable(), EventEmitter);
@injectable()
export class EventCenter extends EventEmitter {
  async waitEventNms(evName: string, timeout: number): Promise<boolean> {
    return await new Promise((r, j) => {
      let listener: any;
      let to = setTimeout(() => {
        this.off(evName, listener);
        j(false);
      }, timeout);
      listener = () => {
        clearTimeout(to);
        r(true);
      };
      this.once(evName, listener);
    });
  }
  async waitNmsForBackValue<T>(evName: string, timeout: number): Promise<T> {
    return new Promise<T>((r, j) => {
      let listener: any;
      let to = setTimeout(() => {
        this.off(evName, listener);
        j("timeout");
      }, timeout);
      listener = (val: T) => {
        clearTimeout(to);
        r(val);
      };
      this.once(evName, listener);
    });
  }
}
