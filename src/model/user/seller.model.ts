import { Schema, Document, Model, model } from "mongoose";
import { User, UserRole } from "../../types/user.types";
import { ImageInfo } from "../../types/image.types";

interface SellerDocument extends User, Document{
    store_name: string,
    owner_name: string,
    legal_document: [ImageInfo],
    address: string,
    city: string,
    country: string,
}

const SellerSchema: Schema<SellerDocument> = new Schema({
    email: {type: String, required: true, unique: true},
    store_name: {type: String, required: true},
    fullname: {type: String},
    legal_document:[
        {
            url: {type: String}
        }
    ],
    address: {type: String},
    city: {type: String},
    country: {type: String},
    password: {type: String, required: true},
    phone_number: {type: String, maxlength: 10},
    is_verified: {type: Boolean, default: false},
    code: {type: String},
    role: {type: String, enum: UserRole, default: UserRole.SELLER}
})

const Seller: Model<SellerDocument> = model('seller', SellerSchema)

export default Seller