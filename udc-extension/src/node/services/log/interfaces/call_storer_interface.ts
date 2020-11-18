export const CallInfoStorerInterface = Symbol("CallInfoStorerInterface");
export interface CallInfoStorerInterface {
  storeCallInfoInstantly: (
    info: string,
    api: string,
    severity?: number
  ) => void;
  storeCallInfoLatter: (
    time: string,
    info: string,
    api: string,
    severity: number
  ) => void;
}
