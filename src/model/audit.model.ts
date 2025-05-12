import {Schema, Model, model, Document} from 'mongoose';

interface AuditTrailDocument extends Document{
    _id: string,
    url: string,
    activity: string,
    userId: string,
    params: string,
    query: string,
    payload: string,
    response: string
}

const AuditTrailSchema: Schema<AuditTrailDocument> = new Schema({
    url: {type: String, required: true},
    userId: {type: String, required: true},
    activity: {type: String, required: true},
    params: {type: String},
    query: {type: String},
    payload: {type: String},
    response: {type: String}
}, {timestamps: true})

const AuditTrail: Model<AuditTrailDocument> = model('auditTrail', AuditTrailSchema)

export default AuditTrail