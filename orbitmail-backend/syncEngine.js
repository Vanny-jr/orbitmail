const cron = require('node-cron')
const emailModel = require('./models/emailModel')

const syncEmails = async () => {
    try {
        const queued = await emailModel.find({ status: 'queued' })
        if (queued.length === 0) return
        await emailModel.updateMany(
            { status: 'queued' },
            { status: 'sent' }
        )
        console.log(`[SYNC] ${queued.length} email(s) transmitted to Earth.`)
    } catch (err) {
        console.error('[SYNC ERROR]', err.message)
    }
}

cron.schedule('*/20 * * * *', () => {
    syncEmails()
})

module.exports = syncEmails