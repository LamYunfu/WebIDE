import { Skeleton } from "../../../data_center/program_data";
import { promises } from "fs-extra";

export const LdcClientControllerInterface = Symbol(
  "LdcClientControllerInterface"
);
export interface LdcClientControllerInterface {
  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  isConnected: () => boolean
  burn: (ske: Skeleton) => Promise<boolean>;
}
