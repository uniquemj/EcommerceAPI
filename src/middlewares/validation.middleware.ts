import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import createHttpError from "../utils/httperror.utils";


export const validate = (schema: ZodSchema) =>{
    return (req: Request, res: Response, next: NextFunction) =>{
        try{
            const validation = schema.safeParse(req.body)
            if(!validation.success){
                const formattedError = validation.error.issues.map((issue)=>`${issue.path} : ${issue.message}`)
                throw createHttpError.BadRequest('Validation Error.', formattedError)
            }
            req.body = validation.data
            next()
        }catch(error:any){
            throw createHttpError.Custom(error.statusCode, error.message, error.errors)
        }
    }
}