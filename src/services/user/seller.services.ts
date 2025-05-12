import { v4 } from "uuid";
import bcrypt from 'bcryptjs';
import { SellerRepository } from "../../repository/user/seller.repository";
import { SellerInfo, SellerProfile, UserCredentials } from "../../types/user.types";
import createHttpError from "../../utils/httperror.utils";
import { comparePassword, hashPassword } from "../../utils/helper.utils";
import { ProductServices } from "../product.services";
import { AuthService } from "../../types/auth.types";
import { CloudServices } from "../cloud.services";
import { paginationField } from "../../types/pagination.types";


export class SellerServices implements AuthService {

    constructor(private readonly sellerRepository: SellerRepository, private readonly productServices: ProductServices) { }

    async getSellerById(id: string) {
        const sellerExist = await this.sellerRepository.getSellerById(id)
        if (!sellerExist) {
            throw createHttpError.NotFound("Seller does not exist.")
        }
        return sellerExist
    }

    async getSellerList(pagination: paginationField) {
        const sellers = await this.sellerRepository.getSellerList(pagination)
        if (sellers.length == 0) {
            throw createHttpError.NotFound("Seller List is Empty.")
        }
        const count = await this.sellerRepository.getSellerCount()
        return {count, sellers}
    }

    async registerUser(sellerInfo: SellerInfo) {
        const sellerExist = await this.sellerRepository.getSeller(sellerInfo.email)
        if (sellerExist) {
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
    }

    async verifyEmail(code: string) {
        const result = await this.sellerRepository.verify({ code: code }, { is_email_verified: true })
        if (!result) {
            throw createHttpError.BadRequest("Invalid Code.")
        }
        return result
    }

    async verifySeller(sellerId: string) {
        const sellerExist = await this.sellerRepository.getSellerById(sellerId)
        if (!sellerExist) {
            throw createHttpError.NotFound("Seller with Id does not exist.")
        }
        const result = await this.sellerRepository.verify({ _id: sellerId }, { is_verified: true })
        return result
    }

    async loginUser(sellerCredentials: UserCredentials) {
        const sellerExist = await this.sellerRepository.getSeller(sellerCredentials.email)
        if (!sellerExist) {
            throw createHttpError.NotFound('Seller with email not found.')
        }

        if (!sellerExist.is_email_verified) {
            throw createHttpError.BadRequest('Seller is not verified. Please Verify with verificaiton link sent in mail.')
        }

        const isPasswordMatch = await bcrypt.compare(sellerCredentials.password, sellerExist.password)

        if (!isPasswordMatch) {
            throw createHttpError.BadRequest('Invalid Password.')
        }

        const result = await this.sellerRepository.loginSeller(sellerCredentials)
        return result
    }

    async updateSellerInfo(businessInfo: SellerProfile, sellerEmail: string) {
        const sellerExist = await this.sellerRepository.getSeller(sellerEmail)
        if (!sellerExist) {
            throw createHttpError.BadRequest("Seller doesn't exist.")
        }
        const result = await this.sellerRepository.updateSellerInfo(businessInfo, sellerExist._id)
        return result
    }

    async updateBusinessInfo(businessInfo: SellerProfile, legalFiles: Express.Multer.File[], sellerEmail: string){
        if(legalFiles.length !== 2){
            throw createHttpError.BadRequest("Image count must match requirement of 2.")
        }
        
        const imageUrls = await Promise.all(
            legalFiles.map(async(image) =>{
                const secure_url = await CloudServices.uploadImage(image.path)
                return {url: secure_url}
            }) || []
        )
        
        console.log(imageUrls)
        const sellerInfo = {
            ...businessInfo,
            legal_document: imageUrls
        }
        const sellerExist = await this.sellerRepository.getSeller(sellerEmail)
        if (!sellerExist) {
            throw createHttpError.BadRequest("Seller doesn't exist.")
        }

        const result = await this.sellerRepository.updateSellerInfo(sellerInfo, sellerExist._id)
        return result
    }

    async updatePassword(old_password: string, new_password: string, sellerEmail: string) {
        const sellerExist = await this.sellerRepository.getSeller(sellerEmail)
        if (!sellerExist) {
            throw createHttpError.BadRequest("Seller doesn't exist.")
        }

        const isPasswordMatch = await comparePassword(old_password, sellerExist.password)

        if (!isPasswordMatch) {
            throw createHttpError.BadRequest("Old password does not match with current password.")
        }

        const newHashPassword = await hashPassword(new_password)
        const result = await this.sellerRepository.updateSellerInfo({ password: newHashPassword }, sellerExist._id)
        return result
    }

    async deleteSeller(sellerId: string) {
        const sellerExist = await this.sellerRepository.getSellerById(sellerId)
        if (!sellerExist) {
            throw createHttpError.NotFound("Seller with Id not found.")
        }

        const result = await this.sellerRepository.deleteSeller(sellerId)
        const sellerProductList = await this.productServices.getSellerProductList(sellerId,{page: 0, limit: 0},{})

        sellerProductList.product.forEach(async (product) => {
            await this.productServices.editProduct(product._id, { isActive: false })
        })

        return result
    }
}