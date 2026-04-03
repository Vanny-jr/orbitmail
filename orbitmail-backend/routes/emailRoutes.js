const express = require('express')
const emailModel = require('../models/emailModel')
const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const newEmail = new emailModel(req.body)
        await newEmail.save()
        res.json({ success: true, data: newEmail })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.get('/', async (req, res) => {
    try {
        const emails = await emailModel.find()
        res.json({ success: true, data: emails })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await emailModel.findByIdAndDelete(req.params.id)
        res.json({ success: true, data: deleted })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router