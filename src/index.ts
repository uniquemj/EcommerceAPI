import express, { urlencoded } from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import apiRoute from './routes/index'
import errorHandler from './middlewares/errorhandler.middleware'
import cookieParser from 'cookie-parser'
import { v2 as cloudinary } from 'cloudinary'

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

app.listen(PORT, async()=>{
    console.log(`Server running at: ${PORT}.`)
    try{
        await mongoose.connect(MONGODB_URL)
        console.log(`Connected to Database. . .`)
    }catch(error){
        console.log(`Error: Connection to Database Failed. . .`)
    }
})