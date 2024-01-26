const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    ussername: {type: String, required: true},
    password: {type: String, required: true},
    channels: {type: Array, required: true},
    messages: {type: Array, required: true},
    friends: {type: Array, required: true}
})



module.exports = mongoose.model("User", userSchema)