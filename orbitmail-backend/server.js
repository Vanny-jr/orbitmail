const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()

require('./syncEngine')
const emailRoutes = require('./routes/emailRoutes')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/emails', emailRoutes)

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected')
        app.listen(process.env.PORT, () =>
            console.log(`Server running on http://localhost:${process.env.PORT}`))
    })
    .catch((err) => console.error('MongoDB connection error:', err))