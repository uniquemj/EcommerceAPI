
import jwt, { JwtPayload } from 'jsonwebtoken'
import { User } from '../types/auth.types'
import bcrypt from 'bcryptjs'
import { v4 } from 'uuid'

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string

export const signToken = (userInfo: User) =>{
    return jwt.sign(userInfo, JWT_SECRET_KEY, {expiresIn: "1d"})
}

export const verifyJWTToken = (user_token: string) =>{
    return jwt.verify(user_token, JWT_SECRET_KEY) as JwtPayload
}

export const hashPassword = async(password: string) =>{
    return await bcrypt.hash(password, 10)
}

export const comparePassword = async(userInputPassword: string, hashedPassword: string) =>{
    return await bcrypt.compare(userInputPassword, hashedPassword)
}

export const getRandomId = () =>{
    return v4()
}

export const getFolderPath = (baseFolder: string) =>{   
    const date = new Date()
    return `/ecommerce/${baseFolder}/${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
}