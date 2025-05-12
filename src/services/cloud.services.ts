import {v2 as cloudinary} from 'cloudinary'
export class CloudServices {

    static uploadImage = async (imagePath: string) => {
        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: true,
        }

        const result = await cloudinary.uploader.upload(imagePath, options);
        return result.secure_url
    }
}