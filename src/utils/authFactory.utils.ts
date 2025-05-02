import { AdminServices } from "../services/user/admin.services";
import { CustomerServices } from "../services/user/customer.services";
import { SellerServices } from "../services/user/seller.services";
import { AuthService, UserType } from "../types/auth.types";


export class AuthServiceFactory{
    constructor(private readonly adminServices: AdminServices, private readonly customerServices: CustomerServices, private readonly sellerServices: SellerServices){}

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