import AuditTrail from "../model/audit.model";
import { AuditTrailInfo } from "../types/audit.types";
import { AuditTrailRepositoryInterface } from "../types/repository.types";


export class AuditTrailRepository implements AuditTrailRepositoryInterface{
    async findAll(): Promise<AuditTrailInfo[]>{
        return await AuditTrail.find({}).sort('-createdAt')
    }
    async create(payload: AuditTrailInfo):Promise<AuditTrailInfo>{
        return await AuditTrail.create({...payload})
    }
}