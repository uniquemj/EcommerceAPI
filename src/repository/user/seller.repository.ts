import jwt from 'jsonwebtoken'
import Seller from "../../model/user/seller.model";
import { SellerInfo, UserCredentials, User } from "../../types/user.types";


const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string

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

        const token = jwt.sign({_id: seller?._id, email: seller?.email, role: seller?.role, is_verified: seller?.is_verified}, JWT_SECRET_KEY, {expiresIn: "1d"})

        return {token, seller}
    }
}