import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
let testContainer: Container;
testContainer = new Container();
testContainer.load(new ContainerModule(() => {}));
