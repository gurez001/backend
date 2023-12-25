const mongoose = require('mongoose');

const toggleSchema = new mongoose.Schema({
    newProduct:{
        type:Boolean,
        default:true
    },
    discountProduct:{
        type:Boolean,
        default:false
    },
})

module.exports = mongoose.model('Togel',toggleSchema)