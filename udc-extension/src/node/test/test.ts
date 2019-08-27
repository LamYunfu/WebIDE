import { injectable } from "inversify";

@injectable()
export class sp {
    split() {
        let x = `::config##{"name":"test","passwd":"string"}`.split("##")
        for (let index = 0; index < x.length; index++) {
            console.log(index + ": " + x[index])
        }
    }
}