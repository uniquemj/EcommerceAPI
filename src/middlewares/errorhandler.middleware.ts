import { NextFunction, Request, Response } from "express";
import Logger from "../utils/logger.utils";

const logger = Logger.getInstance().logger()
const errorHandler = (err:any, req: Request, res: Response, next: NextFunction) =>{
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'
    const errors = err.errors || []

    logger.error({message: message, statusCode: err.statusCode, errors: err.errors})
    res.status(statusCode).send({message: message, success: false, errors: errors})
}

export default errorHandler