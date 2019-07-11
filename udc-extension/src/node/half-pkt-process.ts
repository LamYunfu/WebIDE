import * as EventEmitor from 'events'
class HalfPackProcess extends EventEmitor{

}
let hpp =new HalfPackProcess()
hpp.on("abc",()=>{
    console.log( "a aa you print abc")
})
