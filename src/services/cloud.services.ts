import {v2 as cloudinary} from 'cloudinary'
import { getFolderPath } from '../utils/helper.utils';
import { FileServices } from './file.services';
import { inject, injectable } from 'tsyringe';

@injectable()
export class CloudServices {

    constructor(@inject(FileServices) private readonly fileService: FileServices){}

    uploadImage = async (imagePath: Express.Multer.File, baseFolder: string, type: string) => {
        const options = {
            folder: getFolderPath(baseFolder),
            use_filename: true,
            unique_filename: false,
            overwrite: true,
        }

        const cloud_upload = await cloudinary.uploader.upload(imagePath.path, options);
        
        const fileMetaData = {
            original_name: imagePath.originalname,
            type: type,
            size: imagePath.size,
            blob_path: cloud_upload.public_id,
            url: cloud_upload.secure_url
        }
 
        const result = await this.fileService.createFile(fileMetaData)
        return result
    }
}