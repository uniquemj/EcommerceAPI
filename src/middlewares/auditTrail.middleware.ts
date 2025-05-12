import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import { AuditTrailServices } from "../services/audit.services";
import winston from 'winston'

const methodMappers: Record<string, string> = {
    GET: "READ",
    POST: "CREATE",
    PUT: "UPDATE",
    PATCH: "MODIFY",
    DELETE: "DELETE"
}

export const createAuditTrailMiddleware = (logger: winston.Logger, auditTrailServices: AuditTrailServices) =>{
    return (req: AuthRequest, res: Response, next: NextFunction)=>{
        try{
            const exclude_path = ['/api/auth', '/api/docs', '/api/audit-log', '/api/admin/password', '/api/customer/password', '/api/seller/password']
            if(exclude_path.some(path => req.originalUrl.startsWith(path))){
                return next()
            }

            const originalJson = res.json.bind(res);

            res.json = function(data: any){
                const url = req.originalUrl
                const resourceIndex = url.split('/').findIndex((resource) => resource == 'api')
                const resource = url.split('/').slice(resourceIndex+1)
                const method = req.method

                const body = {
                    url: url,
                    activity: `${methodMappers[method]} ${resource}`,
                    userId: req.user?._id || 'anonymous',
                    params: JSON.stringify(req.params),
                    query: JSON.stringify(req.query),
                    payload: JSON.stringify(req.body),
                    response: JSON.stringify(data)
                }

                auditTrailServices.createAuditTrail(body)
                .then(()=>logger.info(`[Audit Trail] logged ${req.method} ${url}`))
                .catch((error)=>logger.error(`[Audit Trail] logging failed: ${error}`))

                return originalJson(data)
            }
            next()
        }catch(error){
            logger.error("Error while logging Audit Trail.", error)
            next(new Error("Error while logging Audit Trail."))
        }
    }
}
