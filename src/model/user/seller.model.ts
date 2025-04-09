import { Schema, Document, Model, model } from "mongoose";
import { IUser, UserRole } from "../../types/user.types";

interface SellerDocument extends IUser, Document{
    store_name: string,
}

const SellerSchema: Schema<SellerDocument> = new Schema({
    email: {type: String, required: true, unique: true},
    store_name: {type: String, required: true},
    password: {type: String, required: true},
    phone_number: {type: String, maxlength: 10},
    is_verified: {type: Boolean, default: false},
    code: {type: String},
    role: {type: String, enum: UserRole, default: UserRole.SELLER}
})

const Seller: Model<SellerDocument> = model('seller', SellerSchema)

export default Seller