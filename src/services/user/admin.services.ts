import { AdminRepository } from "../../repository/user/admin.repository";
import { AuthService } from "../../types/auth.types";
import { AdminInfo, AdminProfile, UserCredentials } from "../../types/user.types";
import { comparePassword, hashPassword, signToken } from "../../utils/helper.utils";
import createHttpError from "../../utils/httperror.utils";

export class AdminServices implements AuthService{
    constructor(private readonly adminRepository: AdminRepository){}

    async getAllAdmin(){
        try{
            const result = await this.adminRepository.getAllAdmin()
            if(result.length == 0){
                throw createHttpError.NotFound("Admin List Empty")
            }
            return result
        }catch(error){
            throw error
        }
    }

    async getAdminDetail(id: string){
        try{
            const adminExist = await this.adminRepository.getAdminById(id)
            if(!adminExist){
                throw createHttpError.NotFound("Admin with Id does not exist.")
            }
            return adminExist
        }catch(error){
            throw error
        }
    }

    async registerUser(userInfo: AdminInfo){
        try{
            const adminExist = await this.adminRepository.getAdminByEmail(userInfo.email)
            if(adminExist){
                throw createHttpError.BadRequest("Admin with Email exist.")
            }
            const hashedPassword = await hashPassword(userInfo.password)
            userInfo.password = hashedPassword
            const result = await this.adminRepository.createAdmin(userInfo)
            return result
        }catch(error){
            throw error
        }
    }

    async loginUser(userCredentials: UserCredentials){
        try{
            const adminExist = await this.adminRepository.getAdminByEmail(userCredentials.email)

            if(!adminExist){
                throw createHttpError.NotFound("Admin with email does not exist.")
            }

            const isPasswordMatch = await comparePassword(userCredentials.password, adminExist.password)
            if(!isPasswordMatch){
                throw createHttpError.BadRequest("Invalid Password")
            }

            const result = await this.adminRepository.loginAdmin(userCredentials)
            return result
        }catch(error){
            throw error
        }
    }

    async updateAdmin(updateAdminInfo: AdminProfile, adminId: string){
        try{
            const adminExist = await this.adminRepository.getAdminById(adminId)

            if(!adminExist){
                throw createHttpError.NotFound("Admin does not exist.")
            }
            if(updateAdminInfo.password){
                const hashedPassword = await hashPassword(updateAdminInfo.password)
                updateAdminInfo.password = hashedPassword
            }
            const result = await this.adminRepository.updateAdmin(updateAdminInfo, adminId)
            return result
        }catch(error){
            throw error
        }
    }

    async deleteAdmin(adminId: string, userId: string){
        try{
            if(adminId == userId){
                throw createHttpError.BadRequest("You can't delete yourself.")
            }
            const adminExist = await this.adminRepository.getAdminById(adminId)
            if(!adminExist){
                throw createHttpError.NotFound("Admin does not exist.")
            }
            const result = await this.adminRepository.deleteAdmin(adminId)
            return result
        }catch(error){
            throw error
        }
    }

    async updatePassword(old_password: string, new_password: string, userEmail :string){
        try{
            const adminExist = await this.adminRepository.getAdminByEmail(userEmail)

            if(!adminExist){
                throw createHttpError.NotFound("Admin does not exist.")
            }
            const isPasswordMatch = await comparePassword(old_password, adminExist.password)
            if(!isPasswordMatch){
                throw createHttpError.BadRequest("Old password doesn not match with current password.")
            }
            const newHashedPassword = await hashPassword(new_password)
            const result = await this.adminRepository.updateAdmin({password: newHashedPassword}, adminExist._id as string)
            return result
        }catch(error){
            throw error
        }
    }
}