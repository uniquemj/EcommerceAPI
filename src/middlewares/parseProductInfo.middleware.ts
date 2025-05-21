import { NextFunction, Request, Response } from "express";
import createHttpError from "../utils/httperror.utils";


export const parseProductInfo = (req: Request, res: Response, next: NextFunction) =>{
    try{
        if(!req.body.variants){
            throw createHttpError.BadRequest("At least one Variant is required.")
        }

        if(typeof req.body.variants === 'string'){
            req.body.variants = JSON.parse(req.body.variants);
        }
        
        next()
    }catch(error){
        throw createHttpError.BadRequest(`Invalid JSON format in variants: ${error instanceof Error? error.message: error}`)
    }
}