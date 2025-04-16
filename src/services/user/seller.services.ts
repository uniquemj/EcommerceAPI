import { v4 } from "uuid";
import bcrypt from 'bcryptjs';
import { SellerRepository } from "../../repository/user/seller.repository";
import { SellerInfo,UserCredentials } from "../../types/user.types";
import createHttpError from "../../utils/httperror.utils";

export class SellerServices{
    private readonly sellerRepository: SellerRepository;

    constructor(){
        this.sellerRepository = new SellerRepository();
    }

    async registerSeller(sellerInfo: SellerInfo){
        try{
            const sellerExist = await this.sellerRepository.getSeller(sellerInfo.email)
            if(sellerExist){
                throw createHttpError.BadRequest("Seller with Email exists.")
            }

            const hashedPassword = await bcrypt.hash(sellerInfo.password, 10)

            const sellerDetail = {
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

            if(!sellerExist.is_verified){
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
}