// import * as WebSocket from 'ws'
// import * as fs from 'fs'
// describe("ws", () => {
//     it("ws", () => {
//         let tinySimRequest = new WebSocket(
//             "ws://47.98.249.190:8004/", {
//                 // "ws://localhost:8765/", {

//             }
//         )

//         tinySimRequest.on("message", (data: string) => {
//             let tmp = new Buffer(data).toString('utf8')
//             console.log(tmp.toString())
//         })
//         tinySimRequest.on("open", () => {
//             console.log("send buffer")
//             let buff = fs.readFileSync(`/home/project/main.cpp`, { encoding: 'utf8' })
//             tinySimRequest.send(buff, () => {
//                 console.log("send buffer scc")
//                 tinySimRequest.send("quit")
//             })

//             // setTimeout(() => {
//             //     tinySimRequest.terminate()
//             // }, 2000)
//         }


//         )


//     })
// })