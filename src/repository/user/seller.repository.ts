import Seller from "../../model/user/seller.model";
import { SellerInfo, UserCredentials} from "../../types/user.types";
import { signToken } from '../../utils/helper.utils';


export class SellerRepository{
    async getSeller(email: string){
        return await Seller.findOne({email: email})
    }

    async registerSeller(sellerInfo: SellerInfo){
        const newSeller = (await Seller.create(sellerInfo))
        const seller = await Seller.findById(newSeller._id).select('-password')
        return seller
    }

    async verifySeller(code: string){
        const seller = await Seller.findOne({code: code})
        const result = await Seller.findByIdAndUpdate(seller?._id, {is_verified: true}, {new: true}).select('-password')
        return result
    }

    async loginSeller(sellerCredentials: UserCredentials){
        const seller = await Seller.findOne({email: sellerCredentials.email}).select('-password') as SellerInfo

        const token = signToken({_id: seller?._id, email: seller?.email, role: seller?.role, is_verified: seller?.is_verified})

        return {token, seller}
    }
}