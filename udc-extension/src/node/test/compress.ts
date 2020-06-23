import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
import { bindServices } from "../services/bind_service";
import { bindDataCenter } from "../data_center/bind_data_center";
import { bindTools } from "../services/tools/bind_tools";
import { bindFileTemplate } from "../services/file_template/file_template";
import { FileTemplateInterface } from "../services/file_template/interfaces/file_template_interface";
import { FileCompressor } from "../services/tools/file_compressor";

const testContainer = new Container();
testContainer.load(
  new ContainerModule((bind) => {
    bindTools(bind);
    bindServices(bind);
    bindDataCenter(bind);
    bindFileTemplate(bind);
    bind(FileCompressor).toSelf();
  })
);
// let data = (testContainer.get<LdcData>(LdcData).model = "alios_esp32");
// testContainer
//   .get<LdcClientControllerInterface>(LdcClientControllerInterface)
//   .connect()
//   .then((res) => {
//     console.log(res);
//     // testContainer
//     //   .get<LdcClientControllerInterface>(LdcClientControllerInterface)
//     //   .disconnect();
//   });
testContainer
  .get<FileCompressor>(FileCompressor)
  .compress("d:\\abcd\\device", "d:\\a.zip")
  .then((res) => {
    console.log(res);
    testContainer
      .get<FileCompressor>(FileCompressor)
      .getHash("d:\\a.zip")
      .then((res) => {
        console.log(`"${res}"`);
        // testContainer
        //   .get<LdcClientControllerInterface>(LdcClientControllerInterface)
        //   .disconnect();
      });
    // testContainer
    //   .get<LdcClientControllerInterface>(LdcClientControllerInterface)
    //   .disconnect();
  });
