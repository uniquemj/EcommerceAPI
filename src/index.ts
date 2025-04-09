import express, { urlencoded } from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import apiRoute from './routes/index'
import errorHandler from './middlewares/errorhandler.middleware'

const app = express()

app.use(express.json())
app.use(urlencoded({extended: true}))

app.use('/api', apiRoute)
app.use(errorHandler)

const PORT = process.env.PORT || 8000
const MONGODB_URL = process.env.MONGODB_URL as string

app.listen(PORT, async()=>{
    console.log(`Server running at: ${PORT}.`)
    try{
        await mongoose.connect(MONGODB_URL)
        console.log(`Connected to Database. . .`)
    }catch(error){
        console.log(`Error: Connection to Database Failed. . .`)
    }
})