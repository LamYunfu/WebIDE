import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
import { bindServices } from "../services/bind_service";
import { bindDataCenter } from "../data_center/bind_data_center";
import { bindTools } from "../services/tools/bind_tools";
import { bindFileTemplate } from "../services/file_template/file_template";
import { FileTemplateInterface } from "../services/file_template/interfaces/file_template_interface";
import { LdcClientControllerInterface } from "../services/ldc/interfaces/ldc_client_controller_interface";

const testContainer = new Container();
testContainer.load(
  new ContainerModule((bind) => {
    bindTools(bind);
    bindServices(bind);
    bindDataCenter(bind);
    bindFileTemplate(bind);
  })
);
testContainer
  .get<LdcClientControllerInterface>(LdcClientControllerInterface)
  .connect()
  .then((res) => {
    console.log(res);
    // testContainer
    //   .get<LdcClientControllerInterface>(LdcClientControllerInterface)
    //   .disconnect();
  });
