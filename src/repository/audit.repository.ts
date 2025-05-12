import AuditTrail from "../model/audit.model";
import { AuditTrailInfo } from "../types/audit.types";
import { paginationField } from "../types/pagination.types";
import { AuditTrailRepositoryInterface } from "../types/repository.types";


export class AuditTrailRepository implements AuditTrailRepositoryInterface{
    async findAll(paignation: paginationField): Promise<AuditTrailInfo[]>{
        return await AuditTrail.find({})
        .sort('-createdAt')
        .skip((paignation.page - 1) * paignation.limit)
        .limit(paignation.limit)
    }

    async getAuditCount(): Promise<number>{
        return await AuditTrail.countDocuments()
    }
    async create(payload: AuditTrailInfo):Promise<AuditTrailInfo>{
        return await AuditTrail.create({...payload})
    }
}