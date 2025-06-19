const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    dataId: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('UserData', userSchema);