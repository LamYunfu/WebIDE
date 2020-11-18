import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
describe("demo", () => {
  let testContainer: Container;
  beforeEach(() => {
    testContainer = new Container();
    testContainer.load(new ContainerModule(() => {}));
  });
  it("demo", () => {});
});
