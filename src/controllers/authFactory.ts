import { inject, injectable } from "tsyringe";
import { AdminServices } from "../services/user/admin.services";
import { CustomerServices } from "../services/user/customer.services";
import { SellerServices } from "../services/user/seller.services";
import { AuthService, UserType } from "../types/auth.types";

@injectable()
export class AuthServiceFactory{
    constructor(@inject(AdminServices) private readonly adminServices: AdminServices, @inject(CustomerServices) private readonly customerServices: CustomerServices, @inject(SellerServices) private readonly sellerServices: SellerServices){}

    getService(userType: UserType):AuthService{
        switch(userType){
            case UserType.ADMIN:
                return this.adminServices
            case UserType.CUSTOMER:
                return this.customerServices
            case UserType.SELLER:
                return this.sellerServices
            default:
                throw new Error("Unsupported User Type.")
        }
    }
}