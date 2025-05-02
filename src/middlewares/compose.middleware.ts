import { NextFunction, Request, RequestHandler, Response } from "express"


export const componseMiddleware = (middlewares: RequestHandler[]): RequestHandler =>{
    return (req: Request, res: Response, next: NextFunction) => {
        let index = 0;

        const run = (err?: any) =>{
            if(err) return next(err)
            if(index >= middlewares.length) return next()
            
            const middleware = middlewares[index++]
            middleware(req, res, run)
        }   
        
        run()
    }
}