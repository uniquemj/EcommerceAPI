import { Response, Router } from "express";
import { allowedRole } from "../middlewares/role.middleware";
import { verifySuperAdmin } from "../middlewares/admin.middleware";
import { AuthRequest } from "../types/auth.types";
import createHttpError from "../utils/httperror.utils";
import { AuditTrailServices } from "../services/audit.services";
import { handleSuccessResponse } from "../utils/httpresponse.utils";

export class AuditTrailController{
    readonly router: Router
    private static instance: AuditTrailController;

    private constructor(private readonly auditTrailServices: AuditTrailServices){
        this.router = Router()
    }   

    static initController(auditTrailServices: AuditTrailServices){
        if(!AuditTrailController.instance){
            AuditTrailController.instance = new AuditTrailController(auditTrailServices);
        }

        const instance = AuditTrailController.instance

        instance.router.get('/', allowedRole('admin'), verifySuperAdmin, instance.getAllAuditTrail)

        return instance
    }

    getAllAuditTrail = async(req: AuthRequest, res: Response) =>{
        try{
            const page = req.query.page || 1
            const limit = req.query.limit || 10
            const result = await this.auditTrailServices.getAllAuditTrails({page: parseInt(page as string), limit: parseInt(limit as string)})
            handleSuccessResponse(res, "Audit Trails List fetched.", result)
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}