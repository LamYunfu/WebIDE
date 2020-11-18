import "reflect-metadata";
import { Container, ContainerModule, injectable, inject } from "inversify";
@injectable()
export class a {
  a = "adasd";
  print() {
    console.log(this.a);
  }
}
@injectable()
export class b {
  constructor(@inject(a) protected aa: a) {}
  a = "fsdaf";
  print() {
    console.log(this.aa);
  }
  assign() {
    this.aa ={a:"asdf",print:()=>{
        
    }}
  }
}
let testContainer: Container;
testContainer = new Container();
testContainer.load(
  new ContainerModule((bind) => {
    bind(a)
      .toSelf()
      .inSingletonScope();
    bind(b)
      .toSelf()
      .inSingletonScope();
  })
);
testContainer.get(a).print();
testContainer.get(b).print();
testContainer.get(b).assign();
testContainer.get(a).print();
testContainer.get(b).print();
