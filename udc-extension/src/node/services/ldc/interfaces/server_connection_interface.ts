import { Skeleton } from "../../../data_center/program_data";

export const ServerConnectionInterface = Symbol("ServerConnectionInterface");
export interface ServerConnectionInterface {
  connect_to_server(
    server_ip: string,
    server_port: number,
    certificate: string,
    pid: string,
    uuid: string,
    token: string
  ): Promise<boolean>;
  disconnect(): Promise<boolean>;
  isConnected(): boolean
  program(ske: Skeleton): Promise<boolean>;
  sendPacket(type: string, content: string): void;
}
