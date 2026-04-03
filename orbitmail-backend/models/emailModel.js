const mongoose = require('mongoose')

const emailSchema = new mongoose.Schema({
    to: { type: String },
    from: { type: String },
    subject: { type: String },
    body: { type: String },
    status: { type: String, default: 'queued' },
    timestamp: { type: Date, default: Date.now }
})

const emailModel = mongoose.model('Email', emailSchema)
module.exports = emailModel