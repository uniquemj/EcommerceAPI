import { v4 } from "uuid";
import bcrypt from 'bcryptjs';
import { CustomerRepository } from "../../repository/user/customer.repository";
import { CustomerInfo, User, UserCredentials } from "../../types/user.types";
import createHttpError from "../../utils/httperror.utils";
import { sendMail } from "../../utils/sendmail.utils";

export class CustomerServices{
    private readonly customerRepository: CustomerRepository;

    constructor(){
        this.customerRepository = new CustomerRepository();
    }

    async registerCustomer(userInfo: CustomerInfo){
        try{
            const customerExist = await this.customerRepository.getCustomer(userInfo.email)

            if(customerExist){
                throw createHttpError.BadRequest("Customer with Email exists.")
            }

            const hashedPassword = await bcrypt.hash(userInfo.password, 10)
            
            const userDetail = {
                fullname: userInfo.fullname,
                email: userInfo.email,
                password: hashedPassword,
                code: v4()
            }
            // const status = await sendMail(userDetail.email, userDetail.code)

            // if(!status){
            //     throw createHttpError.InternalServerError("Something went wrong.")
            // }

            const result = await this.customerRepository.registerCustomer(userDetail)

            return result        
        }catch(error){
            throw error
        }
    }

    async verifyCustomer(code:string){
        try{
            const result = await this.customerRepository.verifyCustomer(code)
            if(!result){
                throw createHttpError.BadRequest("Code not valid.")
            }
            return result
        }catch(error){
            throw error
        }
    }

    async loginCustomer(userCredentials: UserCredentials){
        try{
            const customerExist = await this.customerRepository.getCustomer(userCredentials.email) as CustomerInfo
            if(!customerExist){
                throw createHttpError.NotFound("Customer with email doesn't exist.")
            }

            if(!customerExist.is_verified){
                throw createHttpError.BadRequest("Customer is not verified. Please Verify with verificaiton link sent in mail.")
            }

            const isPasswordMatch = await bcrypt.compare(userCredentials.password, customerExist.password)

            if(!isPasswordMatch){
                throw createHttpError.BadRequest("Invalid Password.")
            }
            const result = await this.customerRepository.loginCustomer(userCredentials)
            return result
        }catch(error){
            throw error
        }
    }
}