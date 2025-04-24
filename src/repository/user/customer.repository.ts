import Customer from "../../model/user/customer.model";
import { CustomerInfo, CustomerProfile, UserCredentials} from "../../types/user.types";
import { signToken } from "../../utils/helper.utils";

export class CustomerRepository{
    async getCustomer(email: string){
        return await Customer.findOne({email: email})
    }

    async registerCustomer(userInfo: CustomerInfo){
        const newCustomer = await Customer.create(userInfo)
        const result = await Customer.findById(newCustomer._id).select('-password')
        return result
    }

    async verifyCustomer(code: string){
        const user = await Customer.findOne({code: code})
        const result = await Customer.findByIdAndUpdate(user?._id, {is_verified: true}, {new: true}).select('-password')
        return result
    }

    async loginCustomer(userCredentials: UserCredentials){
        const user = await Customer.findOne({email: userCredentials.email}).select('-password') as CustomerInfo

        const token = signToken({_id: user?._id,email: user?.email, role: user?.role, is_verified: user?.is_verified})
 
        return {token, user}
    }

    async updateCustomerInfo(userId: string, updateInfo: CustomerProfile){
        return await Customer.findByIdAndUpdate(userId, updateInfo, {new: true}).select('-password -verified -code -role -is_verified')
    }
}