import Admin from "../../model/user/admin.model";
import { AdminInfo, AdminProfile, UserCredentials } from "../../types/user.types";
import { signToken } from "../../utils/helper.utils";

export class AdminRepository{
    async getAllAdmin(){
        return await Admin.find({}).select('-password')
    }

    async getAdminById(id: string){
        return await Admin.findById(id).select('-password')
    }
    async getAdminByEmail(email: string){
        return await Admin.findOne({email: email})
    }

    async createAdmin(adminInfo: AdminInfo){
        const admin = await Admin.create(adminInfo)
        const result = await Admin.findById(admin._id).select('-password')
        return result
    }

    async loginAdmin(userCredentials: UserCredentials){
        const admin = await Admin.findOne({email: userCredentials.email}).select('-password') as AdminInfo 
        const token = signToken({_id: admin._id, email: admin.email, role: admin.role, isSuperAdmin: admin.isSuperAdmin})
        return {token, user: admin}
    }

    async updateAdmin(adminInfo: AdminProfile, adminId: string){
        return await Admin.findByIdAndUpdate(adminId, adminInfo, {new: true}).select('-password')
    }

    async deleteAdmin(adminId: string){
        return await Admin.findByIdAndDelete(adminId).select('-password')
    }
}