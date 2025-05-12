import { AdminRepository } from "../../repository/user/admin.repository";
import { AuthService } from "../../types/auth.types";
import { paginationField } from "../../types/pagination.types";
import { AdminRepositoryInterface } from "../../types/repository.types";
import { AdminInfo, AdminProfile, UserCredentials } from "../../types/user.types";
import { comparePassword, hashPassword, signToken } from "../../utils/helper.utils";
import createHttpError from "../../utils/httperror.utils";

export class AdminServices implements AuthService {
    constructor(private readonly adminRepository: AdminRepositoryInterface) { }

    async getAllAdmin(pagination: paginationField) {
        const result = await this.adminRepository.getAllAdmin(pagination)
        if (result.length == 0) {
            throw createHttpError.NotFound("Admin List Empty")
        }
        const count = await this.adminRepository.getAdminCount()
        return {count: count, admins: result}
    }

    async getAdminDetail(id: string) {
        const adminExist = await this.adminRepository.getAdminById(id)
        if (!adminExist) {
            throw createHttpError.NotFound("Admin with Id does not exist.")
        }
        return adminExist
    }

    async registerUser(userInfo: AdminInfo) {
        const adminExist = await this.adminRepository.getAdminByEmail(userInfo.email)
        if (adminExist) {
            throw createHttpError.BadRequest("Admin with Email exist.")
        }
        const hashedPassword = await hashPassword(userInfo.password)
        userInfo.password = hashedPassword
        const result = await this.adminRepository.createAdmin(userInfo)
        return result
    }

    async loginUser(userCredentials: UserCredentials) {
        const adminExist = await this.adminRepository.getAdminByEmail(userCredentials.email)

        if (!adminExist) {
            throw createHttpError.NotFound("Admin with email does not exist.")
        }

        const isPasswordMatch = await comparePassword(userCredentials.password, adminExist.password)
        if (!isPasswordMatch) {
            throw createHttpError.BadRequest("Invalid Password")
        }

        const result = await this.adminRepository.loginAdmin(userCredentials)
        return result
    }

    async updateAdmin(updateAdminInfo: AdminProfile, adminId: string) {
        const adminExist = await this.adminRepository.getAdminById(adminId)

        if (!adminExist) {
            throw createHttpError.NotFound("Admin does not exist.")
        }
        if (updateAdminInfo.password) {
            const hashedPassword = await hashPassword(updateAdminInfo.password)
            updateAdminInfo.password = hashedPassword
        }
        const result = await this.adminRepository.updateAdmin(updateAdminInfo, adminId)
        return result
    }

    async deleteAdmin(adminId: string, userId: string) {
        if (adminId == userId) {
            throw createHttpError.BadRequest("You can't delete yourself.")
        }
        const adminExist = await this.adminRepository.getAdminById(adminId)
        if (!adminExist) {
            throw createHttpError.NotFound("Admin does not exist.")
        }
        const result = await this.adminRepository.deleteAdmin(adminId)
        return result
    }

    async updatePassword(old_password: string, new_password: string, userEmail: string) {
        const adminExist = await this.adminRepository.getAdminByEmail(userEmail)

        if (!adminExist) {
            throw createHttpError.NotFound("Admin does not exist.")
        }
        const isPasswordMatch = await comparePassword(old_password, adminExist.password)
        if (!isPasswordMatch) {
            throw createHttpError.BadRequest("Old password doesn not match with current password.")
        }
        const newHashedPassword = await hashPassword(new_password)
        const result = await this.adminRepository.updateAdmin({ password: newHashedPassword }, adminExist._id as string)
        return result
    }
}