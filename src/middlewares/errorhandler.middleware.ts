import { NextFunction, Request, Response } from "express";


const errorHandler = (err:any, req: Request, res: Response, next: NextFunction) =>{
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'
    const errors = err.errors || []

    res.status(statusCode).send({message: message, success: false, errors: errors})
    next()
}

export default errorHandler