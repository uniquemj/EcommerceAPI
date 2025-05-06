import { v4 } from "uuid";
import bcrypt from 'bcryptjs';
import { SellerRepository } from "../../repository/user/seller.repository";
import { SellerInfo,SellerProfile,UserCredentials } from "../../types/user.types";
import createHttpError from "../../utils/httperror.utils";
import { comparePassword, hashPassword} from "../../utils/helper.utils";
import { ProductServices } from "../product.services";
import { AuthService } from "../../types/auth.types";


export class SellerServices implements AuthService{
    
    constructor(private readonly sellerRepository: SellerRepository, private readonly productServices: ProductServices){}

    async getSellerById(id: string){
        try{
            const sellerExist = await this.sellerRepository.getSellerById(id)
            if(!sellerExist){
                throw createHttpError.NotFound("Seller does not exist.")
            }
            return sellerExist
        }catch(error){
            throw error
        }
    }

    async getSellerList(){
        try{
            const sellers = await this.sellerRepository.getSellerList()
            if(sellers.length == 0){
                throw createHttpError.NotFound("Seller List is Empty.")
            }
            return sellers
        }catch(error){
            throw error
        }
    }
    async registerUser(sellerInfo: SellerInfo){
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

    async verifyEmail(code: string){
        try{
            const result = await this.sellerRepository.verify({code: code}, {is_email_verified: true})
            if(!result){
                throw createHttpError.BadRequest("Invalid Code.")
            }
            return result
        }catch(error){
            throw error
        }
    }

    async verifySeller(sellerId: string){
        try{    
            const sellerExist = await this.sellerRepository.getSellerById(sellerId)
            if(!sellerExist){
                throw createHttpError.NotFound("Seller with Id does not exist.")
            }
            const result = await this.sellerRepository.verify({_id: sellerId}, {is_verified: true})
            return result
        }catch(error){
            throw error
        }
    }

    async loginUser(sellerCredentials: UserCredentials){
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

    async deleteSeller(sellerId: string){
        try{
            const sellerExist = await this.sellerRepository.getSellerById(sellerId)
            if(!sellerExist){
                throw createHttpError.NotFound("Seller with Id not found.")
            }

            const result = await this.sellerRepository.deleteSeller(sellerId)
            const sellerProductList = await this.productServices.getSellerProductList(sellerId, {})

            sellerProductList.forEach(async(product)=>{
                await this.productServices.editProduct(product._id as unknown as string, {isActive: false})
            })

            return result
        }catch(error){
            throw error
        }
    }
}