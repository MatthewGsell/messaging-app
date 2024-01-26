const mongoose = require('mongoose')


const serverSchema = mongoose.Schema({
    name: {type: String, required: true},
    users: {type: Array, required: true},
    channels: {type: Array, required: true},
    voice_channels: {type: Array, required: true}
    
})


module.exports = mongoose.model("Server", serverSchema)