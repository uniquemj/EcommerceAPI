import { inject, injectable } from "tsyringe";
import { FileRepositoryInterface } from "../types/repository.types";
import { FileInfo } from "../types/file.types";

@injectable()
export class FileServices{

    constructor(@inject('FileRepositoryInterface') private readonly fileRepository: FileRepositoryInterface){}

    createFile = async(metadata: Omit<FileInfo, '_id'>) =>{
        const result = await this.fileRepository.create(metadata)
        return result
    }

    findById = async(id: string) =>{
        const result = await this.fileRepository.findById(id)
        return result
    }

    findAll = async() =>{
        return await this.fileRepository.findAll()
    }

    delete = async(id: string) =>{
        return await this.fileRepository.delete(id)
    }
}