import { FileInfo } from "../types/file.types";
import File from "../model/file.model";
import { FileRepositoryInterface } from "../types/repository.types";
import { injectable } from "tsyringe";

@injectable()
export class FileRepository implements FileRepositoryInterface{

    async create(metadata: FileInfo ): Promise<FileInfo>{
        return await File.create(metadata)
    }

    async findAll(): Promise<FileInfo[]>{
        return await File.find({})
    }

    async findById(id: string): Promise<FileInfo | null>{
        return await File.findById(id)
    }

    async delete(id: string): Promise<FileInfo | null>{
        return await File.findByIdAndDelete(id)
    }
}
