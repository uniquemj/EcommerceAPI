import {Response} from "express";


export const handleSuccessResponse = (res: Response, message: string, data: any, statusCode: number = 200) =>{
    return res.status(statusCode).send({message: message, success: true, data: data})
}