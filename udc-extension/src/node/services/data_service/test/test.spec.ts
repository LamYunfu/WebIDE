import "reflect-metadata";
import { Container, ContainerModule, interfaces } from "inversify";
import { FreecodingDataService } from "../freecoding_data_service";
describe("demo", () => {
  let testContainer: Container;
  beforeEach(() => {
    testContainer = new Container();
    testContainer.load(
      new ContainerModule((bind: interfaces.Bind) => {
        bind(FreecodingDataService)
          .toSelf()
          .inSingletonScope();
      })
    );
  });
  it("demo", () => {
    // console.log(JSON.stringify(
    //   {
    //       version: "1.0.0",
    //       usage: "queue",
    //       hexFileDir: "hexFiles",
    //       serverType: "tinylink_platform_1",
    //       projects: [
    //         {
    //           projectName: "tinylink",
    //           compileType: "tinylink",
    //           boardType: "tinylink",
    //           burnType: "queue",
    //           program: {
    //             model: "tinylink_platform_1",
    //             runtime: 60,
    //             address: "0x10000",
    //           },
    //         }
    //       ],
    //     },
    // ))
    // testContainer.get<FreecodingDataService>(FreecodingDataService).parseProjectDataFromFile("d://xyz.txt");
  });
});
