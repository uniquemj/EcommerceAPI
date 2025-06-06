import { NextFunction, Request, Response } from "express";
import createHttpError from "../utils/httperror.utils";


export const parseVariant= (req: Request, res: Response, next: NextFunction) => {
    try {
        // req.body = JSON.parse(req.body)
        req.body.price = parseInt(req.body.price)
        req.body.stock = parseInt(req.body.stock) 
        req.body.availability = req.body.availability == "true" ? true : false
        req.body.packageWeight = parseInt(req.body.packageWeight)
        next()
    }catch (error) {
        return next(
            createHttpError.BadRequest(`Invalid JSON format in variants: ${error instanceof Error ? error.message : error}`)
        )
    }
}