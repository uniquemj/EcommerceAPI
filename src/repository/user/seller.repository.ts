import { injectable } from "tsyringe";
import Seller from "../../model/user/seller.model";
import { paginationField } from "../../types/pagination.types";
import { SellerRepositoryInterface } from "../../types/repository.types";
import { SearchUserField, SellerInfo, SellerProfile, UserCredentials, VerifyField} from "../../types/user.types";
import { signToken } from '../../utils/helper.utils';

@injectable()
export class SellerRepository implements SellerRepositoryInterface{

    async getSellerList(pagination: paginationField): Promise<SellerInfo[]>{
        return await Seller.find({})
        .populate({path: 'legal_document', select: '_id url'})
        .populate({path: 'store_logo', select: '_id url'})
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit)
        .select('-password -__v')
    }

    async getSellerCount(): Promise<number>{
        return await Seller.countDocuments()
    }
    async getSellerById(id: string): Promise<SellerInfo | null>{
        return await Seller.findById(id)
        .populate({path: 'legal_document', select: '_id url'})
        .populate({path: 'store_logo', select: '_id url'})
        .select('-password')
    }
    async getSellerByCode(code: string): Promise<SellerInfo | null>{
        return await Seller.findOne({code: code}).select('-password -legal_document -store_logo')
    }

    async getSeller(email: string): Promise<SellerInfo | null>{
        return await Seller.findOne({email: email})
        .populate({path: 'legal_document', select: '_id url'})
        .populate({path: 'store_logo', select: '_id url'})
    }

    async registerSeller(sellerInfo: Partial<SellerInfo>): Promise<SellerInfo | null>{
        const newSeller = await Seller.create(sellerInfo)
        const seller = await Seller.findById(newSeller._id).select('-password')
        return seller
    }

    async verify(search: SearchUserField, verifyStatus: VerifyField): Promise<SellerInfo | null>{
        const seller = await Seller.findOne(search)
        const result = await Seller.findByIdAndUpdate(seller?._id, verifyStatus, {new: true}).select('-password')
        return result
    }

    async loginSeller(sellerCredentials: UserCredentials): Promise<{token: string, user: SellerInfo}>{
        const seller = await Seller.findOne({email: sellerCredentials.email}).select('-password -legal_document').populate({path: 'store_logo', select: '_id url'}) as SellerInfo
        const token = signToken({_id: seller?._id, email: seller?.email, role: seller?.role, is_email_verified: seller?.is_email_verified, is_verified: seller.is_verified})
        return {token, user: seller}
    }

    async updateSellerInfo(sellerInfo: SellerProfile, sellerId: string): Promise<SellerInfo | null>{
        return await Seller.findByIdAndUpdate(sellerId, sellerInfo, {new: true}).select('-password -is_verified -is_email_verified -code -__v').populate({path: 'store_logo', select: '_id url'})
    }

    async deleteSeller(sellerId: string): Promise<SellerInfo | null>{
        return await Seller.findByIdAndDelete(sellerId).select('-password -__v')
    }
}