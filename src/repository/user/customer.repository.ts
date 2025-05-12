import Customer from "../../model/user/customer.model";
import { paginationField } from "../../types/pagination.types";
import { CustomerRepositoryInterface } from "../../types/repository.types";
import { CustomerInfo, CustomerProfile, SearchUserField, UserCredentials, VerifyField} from "../../types/user.types";
import { signToken } from "../../utils/helper.utils";

export class CustomerRepository implements CustomerRepositoryInterface{

    async getCustomerList(pagination: paginationField): Promise<CustomerInfo[]>{
        console.log(await Customer.find().skip((pagination.page-1)*pagination.limit).limit(pagination.limit))
        return await Customer.find({})
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit)
        .select('-password -__v')
    }

    async getCustomerCount():Promise<number>{
        return await Customer.countDocuments()
    }

    async getCustomerById(id: string): Promise<CustomerInfo | null>{
        return await Customer.findById(id).select('-password')
    }

    async getCustomerByEmail(email: string): Promise<CustomerInfo | null>{
        return await Customer.findOne({email: email})
    }

    async registerCustomer(userInfo: Partial<CustomerInfo>): Promise<CustomerInfo | null>{
        const newCustomer = await Customer.create(userInfo)
        const result = await Customer.findById(newCustomer._id).select('-password')
        return result
    }

    async verify(search: SearchUserField, verifyStatus: VerifyField): Promise<CustomerInfo | null>{
        const user = await Customer.findOne(search)
        const result = await Customer.findByIdAndUpdate(user?._id, verifyStatus, {new: true}).select('-password')
        return result
    }

    async loginCustomer(userCredentials: UserCredentials): Promise<{token: string, user: CustomerInfo}>{
        const user = await Customer.findOne({email: userCredentials.email}).select('-password') as CustomerInfo

        const token = signToken({_id: user?._id,email: user?.email, role: user?.role, is_email_verified: user?.is_email_verified})
 
        return {token, user}
    }

    async updateCustomerInfo(userId: string, updateInfo: CustomerProfile): Promise<CustomerInfo | null>{
        return await Customer.findByIdAndUpdate(userId, updateInfo, {new: true}).select('-password -verified -code -role -is_verified')
    }

    async deleteCustomer(customerId: string): Promise<CustomerInfo | null>{
        return await Customer.findByIdAndDelete(customerId).select('-password -__v')
    }
}