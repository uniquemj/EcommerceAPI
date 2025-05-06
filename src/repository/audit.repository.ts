import { timeStamp } from "console";
import AuditTrail from "../model/audit.model";
import { AuditTrailInfo } from "../types/audit.types";


export class AuditTrailRepository{
    async findAll(): Promise<AuditTrailInfo[]>{
        return await AuditTrail.find({}).sort('-createdAt')
    }
    async create(payload: AuditTrailInfo):Promise<AuditTrailInfo>{
        return await AuditTrail.create({...payload})
    }
}