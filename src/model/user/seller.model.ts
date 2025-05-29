import { Schema, Document, Model, model } from "mongoose";
import { User, UserRole, VerificationStatus } from "../../types/user.types";
import { ImageInfo } from "../../types/image.types";

interface SellerDocument extends User, Document{
    _id: string,
    store_name: string,
    legal_document: Array<Schema.Types.ObjectId>,
    address: string,
    city: string,
    country: string,
    is_verified: boolean,
    verification_status: string,
    store_logo: Array<Schema.Types.ObjectId>,
    codeExpiresAt: Date,
    rejection_reason: string
}

const SellerSchema: Schema<SellerDocument> = new Schema({
    email: {type: String, required: true, unique: true},
    store_name: {type: String, required: true},
    fullname: {type: String},
    legal_document:[
        {
            type: Schema.Types.ObjectId, ref: 'file'
        }
    ],
    store_logo: [{type: Schema.Types.ObjectId, ref: 'file'}],
    address: {type: String},
    city: {type: String},
    country: {type: String},
    password: {type: String, required: true},
    phone_number: {type: String, maxlength: 10},
    is_email_verified: {type: Boolean, default: false},
    is_verified: {type: Boolean, default: false},
    code: {type: String},
    role: {type: String, enum: Object.values(UserRole), default: UserRole.SELLER},
    codeExpiresAt: {type: Date},
    verification_status: {type: String, enum: Object.values(VerificationStatus), default: VerificationStatus.PENDING},
    rejection_reason: {type: String}
})

const Seller: Model<SellerDocument> = model('seller', SellerSchema)

export default Seller