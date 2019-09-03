import "reflect-metadata"
// import { ConfigSetter } from './../util/configsetter';
import { Programer } from './../util/programmer';
import { Controller } from '../util/controller';
import { Packet } from '../util/packet';
import { UdcTerminal } from '../util/udc-terminal';
import { Logger } from '../util/logger';
import { UdcCompiler } from './../compilers/udc-compiler';
import { FileMapper } from '../util/filemapper';
import { Emitter } from '@theia/core/lib/common/event';
import { Extractor } from '../util/extractor';
import { Container, ContainerModule } from 'inversify';
import { Compiler } from "../compilers/compiler";
import { AliosCompiler } from "../compilers/alios-compiler";


const testContainer = new Container();
testContainer.load(new ContainerModule(bind => {
    bind(Extractor).toSelf().inSingletonScope();
    bind(Emitter).toSelf().inSingletonScope();
    bind(FileMapper).toSelf().inSingletonScope();
    bind(UdcCompiler).toSelf().inSingletonScope();
    // testContainer.bind(Logger).toSelf().inSingleton
    bind(Logger).toSelf().inSingletonScope();
    bind(UdcTerminal).toSelf().inSingletonScope();
    bind(Packet).toSelf().inSingletonScope();
    bind(Controller).toSelf().inSingletonScope();
    bind(Compiler).toSelf().inSingletonScope();
    bind(AliosCompiler).toSelf().inSingletonScope();
    bind(Programer).toSelf().inSingletonScope();
}));
describe('extractor', () => {
    const ext = testContainer.get(Extractor)
    const uc = testContainer.get(UdcCompiler)
    const cm = testContainer.get(Compiler)
    const ut = testContainer.get(UdcTerminal)
    const fm = testContainer.get(FileMapper)
    const cn = testContainer.get(Controller)
    const pm = testContainer.get(Programer)

    // const al = testContainer.get(AliosCompiler)
    beforeEach(() => {
        uc.cookie = "JSESSIONID=88BB1718ACD5CCE677E063F7E6EF1EAB"
        let info: { [key: string]: {} } = {
            "1": { loginType: "adhoc", timeout: "40", model: "tinylink_platform_1", waitID: "1234567890123456", fns: JSON.stringify(["helloworld.cpp"]), dirName: "串口打印" },
            "2": { loginType: "adhoc", timeout: "40", model: "alios-esp32", waitID: "2345678901234567", fns: JSON.stringify(["helloworld.cpp"]), dirName: "串口打印(AliOS)" }
        }
        ut.initPidQueueInfo(JSON.stringify(info))

    });
    it('filemapper', async () => {
        fm.setFileNameMapper('1', { test: "test" })
        expect(fm.getFileNameMapper("1")).toEqual({ test: "test" })
        fm.setFileNameMapper("1", { test: "test1" })
        expect(fm.getFileNameMapper('1')).toEqual({ test: "test1" })
        fm.setFileNameMapper("1", { test1: "test1" })
        expect(fm.getFileNameMapper("1")).toEqual({ test: "test1", test1: "test1" })
        fm.setFileNameMapper("2", { test1: "test1" })
        expect(fm.getFileNameMapper("1")).toEqual({ test: "test1", test1: "test1" })

    });
    it('ext mkdir', () => {
        const ext = testContainer.get(Extractor)
        const mkdir = ext.mkdir("test", "hexfile")
        expect(mkdir).resolves.toBe(undefined)
    })
    it("extract file", async () => {
        let x = await ext.extract("1")
        expect(x).toBe("scc")
        // expect()
    })
    it("getName", async () => {
        const ext = testContainer.get(Extractor)
        expect(ext.getHexName("abc")).toBe(ext.getHexName("abc"))
        await expect(ext.getHexName("abc")).not.toBe(ext.getHexName("abc "))
    }, 100000)
    it("udc compiler", async () => {
        // uc.cookie = "JSESSIONID=1F6B686F61BD5754A810F15EA6964955"
        // const arry = [["串口打印", "helloworld"]]
        let x = await uc.postSrcFile("helloworld", "串口打印")
        // arry.forEach( (a, b) => expect(uc.postSrcFile(a[1], a[0])).resolves.toBe("scc"))
        expect(x).toBe("scc")
    }, 50000)

    // { loginType: string, timeout: string, model: string, waitID: string, fns: string, dirName: string } }
    it("compiler", async () => {
        // const uc = testContainer.get(UdcCompiler)
        // ut.initPidQueueInfo()
        let x = await cm.compile("1")
        await expect(x).toBe("scc")
    }, 50000)
    it("controller tinylink", async () => {
        await ut.connect("adhoc", "tinylink_platform_1", "1", "20")
        let x = await cn.processIssue("1")
        expect(x).toBe(true)
    }, 50000)
    it("controller alios", async () => {
        await ut.connect("adhoc", "alios-esp32", "2", "20")
        let x = await cn.processIssue("2")
        expect(x).toBe(true)
    }, 50000)
    it("programer", async () => {
        fm.setFileNameMapper('1', { helloworld: "B68656c6c6f776f726c64sketch.ino.hex" })
        let bv = await ut.connect("adhoc", "tinylink_platform_1", "1", "20")
        expect(bv).toBe(true)
        // await cn.processIssue("1")
        let x = await pm.program("1")
        expect(x).toBe(true)
    }, 50000)
    

}
)