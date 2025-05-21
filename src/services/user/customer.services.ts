import { v4 } from "uuid";
import { CustomerRepository } from "../../repository/user/customer.repository";
import { CustomerInfo, CustomerProfile, UserCredentials } from "../../types/user.types";
import createHttpError from "../../utils/httperror.utils";
import { hashPassword, comparePassword, signToken } from "../../utils/helper.utils";
import { AuthService } from "../../types/auth.types";
import { paginationField } from "../../types/pagination.types";
import { CustomerRepositoryInterface } from "../../types/repository.types";
import { inject, injectable } from "tsyringe";
import { NotificationServices } from "../notification.services";
import { custom } from "zod";

@injectable()
export class CustomerServices implements AuthService {
    constructor(@inject('CustomerRepositoryInterface') private readonly customerRepository: CustomerRepositoryInterface, @inject(NotificationServices) private readonly notificationServices:NotificationServices) { }

    async getCustomerList(pagination: paginationField) {
        const customers = await this.customerRepository.getCustomerList(pagination)
        if (customers.length == 0) {
            throw createHttpError.NotFound("Customer List is empty.")
        }
        const count = await this.customerRepository.getCustomerCount()
        return {count: count, customer:customers}
    }

    async getCustomerById(id: string) {
        const customerExist = await this.customerRepository.getCustomerById(id)
        if (!customerExist) {
            throw createHttpError.NotFound("Customer does not exist")
        }
        return customerExist
    }

    async registerUser(userInfo: CustomerInfo) {
        const customerExist = await this.customerRepository.getCustomerByEmail(userInfo.email)

        if (customerExist) {
            throw createHttpError.BadRequest("Customer with Email exists.")
        }

        const hashedPassword = await hashPassword(userInfo.password)

        const userDetail = {
            fullname: userInfo.fullname,
            email: userInfo.email,
            password: hashedPassword,
            code: v4(),
            codeExpiresAt: new Date(Date.now()+1000*60*15)
        }

        const result = await this.customerRepository.registerCustomer(userDetail)
        if(result){
            await this.notificationServices.sendEmailVerification(result?.fullname, result?.email, result?.code as string)        
        }

        return result
    }

    async verifyEmail(code: string) {
        const customer = await this.customerRepository.getCustomerByCode(code);

        if(!customer){
            throw createHttpError.BadRequest("Invalid code.")
        }

        if(customer.is_email_verified){
            throw createHttpError.BadRequest("Email already verified.");
        }

        if(!customer.codeExpiresAt || new Date() > customer.codeExpiresAt){
            throw createHttpError.BadRequest("Verification code expired.");
        }

        const result = await this.customerRepository.updateCustomerInfo(customer._id, { is_email_verified: true, code: null, codeExpiresAt: null})
        return result
    }

    async resendVerificationEmail(email: string){
        const customer = await this.customerRepository.getCustomerByEmail(email);

        if(!customer){
            throw createHttpError.BadRequest("No user found with that email.")
        }

        if(customer.is_email_verified){
            throw createHttpError.BadRequest("Email already verified.")
        }

        const updateInfo = {
            code: v4(),
            codeExpiresAt: new Date(Date.now()+1000*60*15) 
        }
        const result = await this.customerRepository.updateCustomerInfo(customer._id, updateInfo)
        if(result){
            await this.notificationServices.sendEmailVerification(result.fullname, result.email, result?.code as string)
        }
        return result
    }

    async loginUser(userCredentials: UserCredentials) {
        const customerExist = await this.customerRepository.getCustomerByEmail(userCredentials.email) as CustomerInfo

        if (!customerExist) {
            throw createHttpError.NotFound("Customer with email doesn't exist.")
        }

        if (!customerExist.is_email_verified) {
            throw createHttpError.BadRequest("Customer is not verified. Please Verify with verificaiton link sent in mail.")
        }

        const isPasswordMatch = await comparePassword(userCredentials.password, customerExist.password)

        if (!isPasswordMatch) {
            throw createHttpError.BadRequest("Invalid Password.")
        }
        const result = await this.customerRepository.loginCustomer(userCredentials)
        return result
    }

    async updateCustomerInfo(email: string, updateInfo: CustomerProfile) {
        const customerExist = await this.customerRepository.getCustomerByEmail(email)
        if (!customerExist) {
            throw createHttpError.NotFound("Customer with email doesn't exist")
        }
        const result = await this.customerRepository.updateCustomerInfo(customerExist._id, updateInfo)
        return result
    }

    async updatePassword(email: string, oldPassword: string, newPassword: string) {
        const customerExist = await this.customerRepository.getCustomerByEmail(email)

        if (!customerExist) {
            throw createHttpError.NotFound("Customer with email doesn't exist")
        }
        const oldPasswordMatch = await comparePassword(oldPassword, customerExist.password)
        if (!oldPasswordMatch) {
            throw createHttpError.BadRequest("Old passowrd does not match with current password.")
        }

        const newHashPassword = await hashPassword(newPassword)
        const result = await this.customerRepository.updateCustomerInfo(customerExist._id, { password: newHashPassword })

        return result
    }

    async deleteCustomer(customerId: string) {
        const customerExist = await this.customerRepository.getCustomerById(customerId)
        if (!customerExist) {
            throw createHttpError.NotFound("Customer with Id does not exist.")
        }
        const result = await this.customerRepository.deleteCustomer(customerId)
        return result
    }
}