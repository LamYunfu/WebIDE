
//  file is deprecated 
import { injectable } from "inversify";
export type BoardInfo = {
  possibleBoardName: string;
  boardType: string;
  compilerType: string;
};
@injectable()
export class BoardAndCompileType {
  esp32xx: BoardInfo = {
    possibleBoardName: "alios_esp32",
    boardType: "esp32devkitc",
    compilerType: "alios",
  };
  esp32: BoardInfo = {
    possibleBoardName: "esp32devkitc",
    boardType: "esp32devkitc",
    compilerType: "alios",
  };
  devkit: BoardInfo = {
    possibleBoardName: "developerkit",
    boardType: "developerkit",
    compilerType: "alios",
  };
  telosb: BoardInfo = {
    possibleBoardName: "sky",
    boardType: "sky",
    compilerType: "contiki-ng",
  };
  telosb1: BoardInfo = {
    possibleBoardName: "contiki_telosb",
    boardType: "sky",
    compilerType: "contiki-ng",
  };
  cc2650: BoardInfo = {
    possibleBoardName: "srf06-cc26xx",
    boardType: "srf06-cc26xx",
    compilerType: "contiki",
  };
  rsp3: BoardInfo = {
    possibleBoardName: "raspberrypi3",
    boardType: "raspberrypi3",
    compilerType: "raspbian",
  };
  rsp: BoardInfo = {
    possibleBoardName: "raspberry_pi",
    boardType: "raspberrypi3",
    compilerType: "raspbian",
  };
  mega2560: BoardInfo = {
    possibleBoardName: "arduino_mega2560",
    boardType: "arduino:avr:mega:cpu=atmega2560",
    compilerType: "arduino",
  };
  arduinouno: BoardInfo = {
    possibleBoardName: "arduino:avr:uno",
    boardType: "arduino:avr:uno",
    compilerType: "arduino",
  };
  stm32: BoardInfo = {
    possibleBoardName: "stm32f103",
    boardType: "stm32f103",
    compilerType: "stm32",
  };
  getCompileType(boardType: string): string | undefined {
    if (
      boardType == null ||
      boardType.startsWith("tinylink") ||
      boardType.startsWith("mega")
    )
      return "tinylink";
    else {
      let p: any = this;
      for (let k of Object.keys(this)) {
        if (p[`${k}`][`possibleBoardName`] == boardType) {
          return p[`${k}`]["compilerType"];
        }
      }
      return "err";
    }
  }
  getRealBoardType(boardType: string) {
    let p: any = this;
    for (let k of Object.keys(this)) {
      if (p[`${k}`][`possibleBoardName`] == boardType) {
        return p[`${k}`]["boardType"];
      }
    }
    if (
      boardType == null ||
      boardType.startsWith("tinylink") ||
      boardType.startsWith("mega")
    )
      return "tinylink";
    else return "err";
  }
}
// AliOS的esp32devkitc
// esp32devkitc
// alios
// AliOS的developerkit
// developerkit
// alios
// contiki的telosb
// sky
// contiki-ng
// contiki的cc2650
// srf06-cc26xx
// contiki
// 树莓派
// raspberrypi3
// raspbian
// arduino的mega2560
// arduino:avr:mega:cpu=atmega2560
// arduino
// arduino的uno
// arduino:avr:uno
// arduino
// stm32的stm3f103
// stm32f103
// stm32
