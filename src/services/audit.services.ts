import { AuditTrailRepository } from "../repository/audit.repository";
import { AuditTrailInfo } from "../types/audit.types";

export class AuditTrailServices{
    constructor(private readonly auditTrailRepository: AuditTrailRepository){}

    getAllAuditTrails = async(): Promise<AuditTrailInfo[] | []> =>{
        const result = await this.auditTrailRepository.findAll()
        return result
    }
    
    createAuditTrail = async(payload: AuditTrailInfo):Promise<AuditTrailInfo | null> =>{
        const result = await this.auditTrailRepository.create(payload)
        return result
    }
}