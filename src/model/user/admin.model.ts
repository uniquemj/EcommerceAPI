import {Schema, Model, model, Document} from 'mongoose'
import { UserRole } from '../../types/user.types'


interface AdminDocument extends Document{
    fullname: string,
    username: string,
    email: string,
    password: string,
    role: UserRole,
    isSuperAdmin: boolean
}


const adminSchema: Schema<AdminDocument> = new Schema({
    fullname: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength:5},
    role: {type: String, enum: Object.values(UserRole), default: UserRole.ADMIN},
    isSuperAdmin: {type: Boolean, default: false},
})

const Admin: Model<AdminDocument> = model('admin', adminSchema)

export default Admin