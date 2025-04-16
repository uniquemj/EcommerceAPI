import {v2 as cloudinary} from 'cloudinary'

export const uploadImages = async(imagePath: string) =>{
    const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
    }

    try{
        const result = await cloudinary.uploader.upload(imagePath, options);
        return result.secure_url
    }catch(err: any){
        console.log(err)
    }
}