import { v4 } from "uuid";
import bcrypt from 'bcryptjs';
import { SellerRepository } from "../../repository/user/seller.repository";
import { SellerInfo,SellerProfile,UserCredentials } from "../../types/user.types";
import createHttpError from "../../utils/httperror.utils";
import { comparePassword, hashPassword } from "../../utils/helper.utils";

export class SellerServices{
    
    constructor(private readonly sellerRepository: SellerRepository){}

    async registerSeller(sellerInfo: SellerInfo){
        try{
            const sellerExist = await this.sellerRepository.getSeller(sellerInfo.email)
            if(sellerExist){
                throw createHttpError.BadRequest("Seller with Email exists.")
            }

            const hashedPassword = await bcrypt.hash(sellerInfo.password, 10)

            const sellerDetail = {
                fullname: sellerInfo.fullname,
                store_name: sellerInfo.store_name,
                email: sellerInfo.email,
                password: hashedPassword,
                code: v4()
            }

            const result = await this.sellerRepository.registerSeller(sellerDetail)
            return result
        }catch(error){
            throw error
        }
    }

    async verifySeller(code: string){
        try{
            const result = await this.sellerRepository.verifySeller(code)
            if(!result){
                throw createHttpError.BadRequest("Invalid Code.")
            }
            return result
        }catch(error){
            throw error
        }
    }

    async loginSeller(sellerCredentials: UserCredentials){
        try{
            const sellerExist = await this.sellerRepository.getSeller(sellerCredentials.email) as unknown as SellerInfo
            if(!sellerExist){
                throw createHttpError.NotFound('Seller with email not found.')
            }

            if(!sellerExist.is_email_verified){
                throw createHttpError.BadRequest('Seller is not verified. Please Verify with verificaiton link sent in mail.')
            }

            const isPasswordMatch = await bcrypt.compare(sellerCredentials.password, sellerExist.password)

            if(!isPasswordMatch){
                throw createHttpError.BadRequest('Invalid Password.')
            }

            const result = await this.sellerRepository.loginSeller(sellerCredentials)
            return result
        }catch(error){
            throw error
        }
    }

    async updateSellerInfo(businessInfo: SellerProfile, sellerEmail: string){
        try{
            const sellerExist = await this.sellerRepository.getSeller(sellerEmail)
            if(!sellerExist){
                throw createHttpError.BadRequest("Seller doesn't exist.")
            }
            const result = await this.sellerRepository.updateSellerInfo(businessInfo, sellerExist._id as string)
            return result
        }catch(error){
            throw error
        }
    }

    async updatePassword(old_password: string, new_password: string, sellerEmail: string){
        try{
            const sellerExist = await this.sellerRepository.getSeller(sellerEmail)
            if(!sellerExist){
                throw createHttpError.BadRequest("Seller doesn't exist.")
            }
            
            const isPasswordMatch = await comparePassword(old_password, sellerExist.password)
            
            if(!isPasswordMatch){
                throw createHttpError.BadRequest("Old password does not match with current password.")
            }

            const newHashPassword = await hashPassword(new_password)
            const result = await this.sellerRepository.updateSellerInfo({password: newHashPassword}, sellerExist._id as string)
            return result
        }catch(error){
            throw error
        }
    }
}