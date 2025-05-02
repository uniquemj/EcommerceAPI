import Seller from "../../model/user/seller.model";
import { SearchUserField, SellerInfo, SellerProfile, UserCredentials, VerifyField} from "../../types/user.types";
import { signToken } from '../../utils/helper.utils';


export class SellerRepository{

    async getSellerList(){
        return await Seller.find({}).select('-password -__v')
    }
    async getSellerById(id: string){
        return await Seller.findById(id).select('-password')
    }

    async getSeller(email: string){
        return await Seller.findOne({email: email})
    }

    async registerSeller(sellerInfo: SellerInfo){
        const newSeller = await Seller.create(sellerInfo)
        const seller = await Seller.findById(newSeller._id).select('-password')
        return seller
    }

    async verify(search: SearchUserField, verifyStatus: VerifyField){
        const seller = await Seller.findOne(search)
        const result = await Seller.findByIdAndUpdate(seller?._id, verifyStatus, {new: true}).select('-password')
        return result
    }

    async loginSeller(sellerCredentials: UserCredentials){
        const seller = await Seller.findOne({email: sellerCredentials.email}).select('-password -legal_document') as SellerInfo
        const token = signToken({_id: seller?._id, email: seller?.email, role: seller?.role, is_email_verified: seller?.is_email_verified, is_verified: seller.is_verified})
        return {token, user: seller}
    }

    async updateSellerInfo(sellerInfo: SellerProfile, sellerId: string){
        return await Seller.findByIdAndUpdate(sellerId, sellerInfo, {new: true}).select('-password -is_verified -is_email_verified -code -__v')
    }

    async deleteSeller(sellerId: string){
        return await Seller.findByIdAndDelete(sellerId).select('-password -__v')
    }
}