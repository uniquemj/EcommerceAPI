import { AuditTrailRepository } from "../repository/audit.repository";
import { AuditTrailInfo } from "../types/audit.types";
import { paginationField } from "../types/pagination.types";

export class AuditTrailServices{
    constructor(private readonly auditTrailRepository: AuditTrailRepository){}

    getAllAuditTrails = async(pagination: paginationField) =>{
        const result = await this.auditTrailRepository.findAll(pagination)
        const count = await this.auditTrailRepository.getAuditCount()
        return {count: count, audits: result}
    }
    
    createAuditTrail = async(payload: AuditTrailInfo) =>{
        const result = await this.auditTrailRepository.create(payload)
        return result
    }
}