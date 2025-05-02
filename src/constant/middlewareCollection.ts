import { verifySuperAdmin } from "../middlewares/admin.middleware";
import { verifyToken } from "../middlewares/auth.middleware";
import { allowedRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validation.middleware";
import { adminLoginSchema, adminRegisterSchema, customerRegisterSchema, loginSchema, sellerRegisterSchema } from "../validation/user.validate";

export const AuthAdmin = {
    register: [
        verifyToken, 
        verifySuperAdmin, 
        allowedRole('admin'), 
        validate(adminRegisterSchema)
    ],
    login:[
        validate(adminLoginSchema)
    ],
    logout:[
        verifyToken, allowedRole('admin')
    ]
}

export const AuthCustomer = {
    register: [
        validate(customerRegisterSchema)
    ],
    login:[
        validate(loginSchema)
    ],
    logout:[
        verifyToken, allowedRole('customer')
    ]
}

export const AuthSeller = {
    register: [
        validate(sellerRegisterSchema)
    ],
    login:[
        validate(loginSchema)
    ],
    logout:[
        verifyToken, allowedRole('seller')
    ]
}