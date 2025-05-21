import { Schema, Document, Model, model } from "mongoose";
import { User } from "../../types/user.types";
import { UserRole } from "../../types/user.types";

interface CustomerDocument extends User, Document{
    _id: string,
    date_of_birth?: Date,
    codeExpiresAt: Date
}

const CustomerSchema: Schema<CustomerDocument> = new Schema({
    fullname: {type: String},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phone_number: {type: String, maxlength: 10},
    is_email_verified: {type: Boolean, default: false},
    date_of_birth: {type: Date},
    code: {type: String},
    codeExpiresAt: {type: Date},
    role: {type: String, enum: Object.values(UserRole), default: UserRole.CUSTOMER},
})

const Customer: Model<CustomerDocument> = model('customer', CustomerSchema)

export default Customer