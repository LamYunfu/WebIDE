import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
import { EventCenter } from "../event_center";
let testContainer: Container;
testContainer = new Container();
testContainer.load(
  new ContainerModule((bind) => {
    bind(EventCenter)
      .toSelf()
      .inSingletonScope();
  })
);
setTimeout(() => {
  testContainer.get<EventCenter>(EventCenter).emit("helloworld");
}, 3000);
setTimeout(() => {
  testContainer.get<EventCenter>(EventCenter).emit("waitforv", 3000);
}, 4000);

// testContainer
//   .get<EventCenter>(EventCenter)
//   .waitEventNms("helloworld", 2000)
//   .then((res) => {
//     console.log(res);
//   });
testContainer
  .get<EventCenter>(EventCenter)
  .waitNmsForBackValue("waitforv", 5000)
  .then((res) => {
    console.log(res);
  });
