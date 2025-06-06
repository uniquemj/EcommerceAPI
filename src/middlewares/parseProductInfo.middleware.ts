import { NextFunction, Request, Response } from "express";
import createHttpError from "../utils/httperror.utils";


export const parseProductInfo = (req: Request, res: Response, next: NextFunction) => {
    // if(req.body.variants === undefined){next()}
    try {
        if (typeof req.body.variants === 'string') {
            req.body.variants = JSON.parse(req.body.variants);
            req.body.warrantyPeriod = JSON.parse(req.body.warrantyPeriod)
        }

        next()
    }catch (error) {
        return next(
            createHttpError.BadRequest(`Invalid JSON format in variants: ${error instanceof Error ? error.message : error}`)
        )
    }
}