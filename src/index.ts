import express, { urlencoded } from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import apiRoute from './routes/index'
import errorHandler from './middlewares/errorhandler.middleware'
import cookieParser from 'cookie-parser'
import { v2 as cloudinary } from 'cloudinary'
import { Logger } from './utils/logger.utils'

const app = express()

app.use(express.json())
app.use(urlencoded({extended: true}))
app.use(cookieParser())

app.use('/api', apiRoute)
app.use(errorHandler)

const PORT = process.env.PORT || 8000
const MONGODB_URL = process.env.MONGODB_URL as string


cloudinary.config({
    secure: true
})

const logger = Logger.getInstance().logger()

app.listen(PORT, async()=>{
    logger.info(`Server running at: ${PORT}`)
    try{
        await mongoose.connect(MONGODB_URL)
        logger.info(`Connected to Database...`)
    }catch(error:unknown){
        logger.error(new Error(error as string))
    }
})