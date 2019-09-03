

import "reflect-metadata"
import { sp } from './test';
import { Container, ContainerModule } from "inversify";
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
testContainer.load(new ContainerModule(bind => {
    bind(sp).toSelf().inSingletonScope();
}));
describe('extractor', () => {
    it("test", () => {
        testContainer.get(sp).split()
    })
    it("find", () => {
        let fn = ["a.cpp"]
        fn.findIndex((val) => {
            if (val.match(`b.*|a.*`) != null) {
                console.log(true)

            }
        })
    })

})
