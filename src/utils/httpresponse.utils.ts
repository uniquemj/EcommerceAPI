import {Response} from "express";


export const handleSuccessResponse = <T>(res: Response, message: string, data: T, statusCode: number = 200 ,...extras: any) =>{
    const merge = Object.assign({}, ...extras)
    return res.status(statusCode).send({message: message, success: true, data: data, ...merge})
}