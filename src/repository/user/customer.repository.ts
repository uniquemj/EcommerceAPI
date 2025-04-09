import Customer from "../../model/user/customer.model";
import { ICustomer, IUserCredentials } from "../../types/user.types";
import jwt from 'jsonwebtoken'


const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

export class CustomerRepository{
    async getCustomer(email: string){
        return await Customer.findOne({email: email})
    }

    async registerCustomer(userInfo: ICustomer){
        const result = await Customer.create(userInfo)
        return result
    }

    async verifyCustomer(code: string){
        const user = await Customer.findOne({code: code})
        const result = await Customer.findByIdAndUpdate(user?._id, {is_verified: true}, {new: true})
        return result
    }

    async loginCustomer(userCredentials: IUserCredentials){
        const user = await Customer.findOne({email: userCredentials.email})

        const token = jwt.sign({_id: user?._id,email: user?.email, role: user?.role, is_verified: user?.is_verified},JWT_SECRET_KEY as string, {expiresIn: "1d"})

        return {token, user}
    }
}