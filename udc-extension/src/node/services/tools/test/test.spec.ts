import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
import { FileCompressor } from "../file_compressor";
import { bindTools } from "../bind_tools";
describe("demo", () => {
  let testContainer: Container;
  beforeEach(() => {
    testContainer = new Container();
    testContainer.load(
      new ContainerModule((bind) => {
        bindTools(bind);
      })
    );
  });
  it("demo", () => {
    console.log(
      testContainer
        .get<FileCompressor>(FileCompressor)
        // .unfold(
        //   `d:/tinylink.zip`,
        //   "dev_bin/sketch/sketch.ino.hex",
        //   // `dev_bin/sketch/sketch.ino.hex`,
        //   "d:/"
        // )
        .unfoldAll(
          `d:/tinylink.zip`,
  
          "d:/abcdefg/"
        )
    );
  });
});
