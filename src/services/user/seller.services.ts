import { v4 } from "uuid";
import bcrypt from 'bcryptjs';
import { SellerRepository } from "../../repository/user/seller.repository";
import { SellerInfo, SellerProfile, UserCredentials, UserRole, VerificationStatus } from "../../types/user.types";
import createHttpError from "../../utils/httperror.utils";
import { comparePassword, hashPassword } from "../../utils/helper.utils";
import { ProductServices } from "../product.services";
import { AuthService } from "../../types/auth.types";
import { CloudServices } from "../cloud.services";
import { paginationField } from "../../types/pagination.types";
import { SellerRepositoryInterface } from "../../types/repository.types";
import { inject, injectable } from "tsyringe";
import { FileType } from "../../types/file.types";
import { NotificationServices } from "../notification.services";


@injectable()
export class SellerServices implements AuthService {

    constructor(@inject('SellerRepositoryInterface') private readonly sellerRepository: SellerRepositoryInterface, @inject(ProductServices) private readonly productServices: ProductServices, @inject(CloudServices) private readonly cloudServices: CloudServices, @inject(NotificationServices) private readonly notificationServices: NotificationServices) { }

    async getSellerById(id: string) {
        const sellerExist = await this.sellerRepository.getSellerById(id)
        if (!sellerExist) {
            throw createHttpError.NotFound("Seller does not exist.")
        }
        return sellerExist
    }

    async getSellerList(pagination: paginationField) {
        const sellers = await this.sellerRepository.getSellerList(pagination)
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
            code: v4(),
            codeExpiresAt: new Date(Date.now() + 1000*60*15)
        }

        const result = await this.sellerRepository.registerSeller(sellerDetail)
        const seller = await this.sellerRepository.getSellerById(result?._id as string)
        if(result){
            await this.notificationServices.sendEmailVerification(result.store_name, result.email, seller?.code as string, UserRole.SELLER)
        }
        return result
    }

    async verifyEmail(code: string) {
        const seller = await this.sellerRepository.getSellerByCode(code)
        console.log(seller)
        if(!seller){
            throw createHttpError.BadRequest("Invalid code.")
        }

        if(seller.is_email_verified){
            throw createHttpError.BadRequest("Email already verified.")
        }

        if(!seller.codeExpiresAt || new Date() > seller.codeExpiresAt){
            throw createHttpError.BadRequest("Verification code expired.")
        }

        const result = await this.sellerRepository.updateSellerInfo({is_email_verified: true, code: null, codeExpiresAt: null}, seller._id)
        return result
    }

    async resendVerificationEmail(email: string){
        const seller = await this.sellerRepository.getSeller(email);

        if(!seller){
            throw createHttpError.BadRequest("No user found with that email.")
        }

        if(seller.is_email_verified){
            throw createHttpError.BadRequest("Email already verified.")
        }

        const updateInfo = {
            code: v4(),
            codeExpiresAt: new Date(Date.now()+1000*60*15) 
        }
        const result = await this.sellerRepository.updateSellerInfo(updateInfo, seller._id )

        if(result){
            await this.notificationServices.sendEmailVerification(result.fullname, result.email, result?.code as string, UserRole.SELLER)
        }
        return result
    }

    async verifySeller(sellerId: string) {
        const sellerExist = await this.sellerRepository.getSellerById(sellerId)
        if (!sellerExist) {
            throw createHttpError.NotFound("Seller with Id does not exist.")
        }
        const result = await this.sellerRepository.updateSellerInfo({is_verified: true, verification_status: VerificationStatus.VERIFIED, rejection_reason: ""}, sellerId)
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

    async updateBusinessInfo(businessInfo: SellerProfile, legalFiles: Express.Multer.File[], store_logo: Express.Multer.File[], sellerEmail: string){
        const sellerExist = await this.sellerRepository.getSeller(sellerEmail)

        if (!sellerExist) {
            throw createHttpError.BadRequest("Seller doesn't exist.")
        }

        if(sellerExist.legal_document.length > 0){
            sellerExist.legal_document.map(async (images)=>{
                await this.cloudServices.destroyImage(String(images))
            })

            sellerExist.store_logo.map(async(images)=>{
                await this.cloudServices.destroyImage(String(images))
            })
        }
        
        if(legalFiles.length !== 2){
            throw createHttpError.BadRequest("Legal Images must be two images.")
        }
        
        if(store_logo.length !==1){
            throw createHttpError.BadRequest("Store logo must be one image.")
        }
        const imageUrls = await Promise.all(
            legalFiles.map(async(image) =>{
                const result = await this.cloudServices.uploadImage(image, 'legal_documents', FileType.LegalDocument)
                return result._id
            }) || []
        )
        
        const sellerLogo = await Promise.all(
            store_logo.map(async(image) =>{
                const result = (await this.cloudServices.uploadImage(image, 'store_logo', FileType.StoreLogo))
                return result._id
            }) || []
        )
        const sellerInfo = {
            ...businessInfo,
            legal_document: imageUrls,
            store_logo: sellerLogo,
            verification_status: VerificationStatus.PENDING,
            rejection_reason: ""
        }

        

        const result = await this.sellerRepository.updateSellerInfo(sellerInfo, sellerExist._id)
        return result
    }

    async updateSellerVerification(id: string, status: string, rejection_reason: string){
        const seller = await this.sellerRepository.getSellerById(id)
        if(!seller){
            throw createHttpError.BadRequest("Seller doesn't exist.")
        }
        const verificationStatus = {
            verification_status: status,
            rejection_reason: rejection_reason,
            is_verified: status == VerificationStatus.REJECTED ? false : true
        }

        const result = await this.sellerRepository.updateSellerInfo(verificationStatus, id)
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

        // if(sellerProductList.product.length > 0){
        //     sellerProductList.product.forEach(async (product) => {
        //         await this.productServices.editProduct(product._id, { isActive: false })
        //     })
        // }

        return result
    }
}