import "reflect-metadata";
import { RaspeberryGccCompiler } from "../compilers/raspberry-gcc-compiler";
import { Container, ContainerModule } from "inversify";
import { Logger } from "../util/logger";
import { UdcTerminal } from "../util/udc-terminal";
import { FileMapper } from "../util/filemapper";
// import { ConfigSetter } from './../util/configsetter';
// import { Container, ContainerModule } from "inversify";
// import { UdcTerminal } from './../util/udc-terminal';
// import { Packet } from './../util/packet';

// const testContainer = new Container();
// testContainer.load(new ContainerModule(bind => {
//     bind(ConfigSetter).toSelf().inSingletonScope();
//     bind(UdcTerminal).toSelf().inSingletonScope();
//     bind(Packet).toSelf().inSingletonScope();
// }));
// const cft = testContainer.get(ConfigSetter)
// it("configsetter", async () => {
//     let x = cft.on()
//     cft.fireOk()
//     expect(x).resolves.toBe("nc")
// }, 50000)
const testContainer = new Container();
testContainer.load(
  new ContainerModule(bind => {
    bind(Logger)
      .toSelf()
      .inSingletonScope();
    bind(RaspeberryGccCompiler)
      .toSelf()
      .inSingletonScope();
    bind(UdcTerminal)
      .toSelf()
      .inSingletonScope();
    bind(FileMapper)
      .toSelf()
      .inSingletonScope();
  })
);
describe("extractor", () => {
  it("test", async() => {
      jest.setTimeout(200000)
    console.log(__dirname);
    let rs = testContainer.get(RaspeberryGccCompiler);
    // rs.archiveFile(__dirname, path.join(__dirname, "/abc.zip"));
    let x=await rs.compile(__dirname)
    expect(x).toEqual("scc")
  });
});
