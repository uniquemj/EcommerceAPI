import { AuditTrailRepository } from "../repository/audit.repository";
import { AuditTrailInfo } from "../types/audit.types";

export class AuditTrailServices{
    constructor(private readonly auditTrailRepository: AuditTrailRepository){}

    getAllAuditTrails = async(): Promise<AuditTrailInfo[] | []> =>{
        try{
            const result = await this.auditTrailRepository.findAll()
            return result
        }catch(error){
            throw error
        }
    }
    
    createAuditTrail = async(payload: AuditTrailInfo):Promise<AuditTrailInfo | null> =>{
        try{
            const result = await this.auditTrailRepository.create(payload)
            return result
        }catch(error){
            throw error
        }
    }
}