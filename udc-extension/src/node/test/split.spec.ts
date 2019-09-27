// let x = require('colors')
import * as color from "colors"
describe("a", () => {
    it("adf", () => {
        let x = JSON.parse(`{"1234567890123456,/dev/tinylink_platform_1-75735303731351C04212":"0","1234567890123456,/dev/tinylink_platform_1-75735303731351C0421":"0"}`)
        let tmp = []
        for (let item of Object.keys(x)) {
            let slices = item.split("/")
            let res = slices[slices.length - 1].trim()
            res != "" ? tmp.push(res) : "";
        }
        console.log("allocated devices:" + tmp.join(";"))
    })
    it("color", () => {
        color.enable()
        console.log("abc".black)
    })

})