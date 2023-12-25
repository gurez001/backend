const mongoose = require('mongoose');

// exports.dbConnect = async (next)=>{
//     try{
//         const connection = await mongoose.connect(process.env.DB,{
//             useNewUrlParser:true,
//             useUnifiedTopology:true,
//         })
//         console.log(`db connect ${connection.connection.host}`)
//     }
//     catch(err){

//         console.log('something is wrong in db'+ err.message)

//     }
// }
exports.dbConnect = () => {
    mongoose.connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then((data)=>console.log(`Db connect ${data.connection.host}`))
    // .catch(err=>console.log(err))
}