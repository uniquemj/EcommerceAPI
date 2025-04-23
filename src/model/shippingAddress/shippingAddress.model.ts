import {Schema, Model, model, Document} from 'mongoose'

interface ShipmentAddressDocument extends Document{
    customer_id: Schema.Types.ObjectId
    full_name: string,
    email: string,
    phone_number: string,
    region: string,
    city: string,
    address: string
}

const shipmentAddressSchema: Schema<ShipmentAddressDocument> = new Schema({
    customer_id: {type: Schema.Types.ObjectId, ref: 'customer'},
    full_name: {type: String, minlength: 3},
    email: {type:String},
    phone_number: {type: String, minlength: 10},
    region: {type: String},
    city: {type: String},
    address: {type: String}
})

const ShipmentAddress: Model<ShipmentAddressDocument> = model('shipmentAddress', shipmentAddressSchema)

export default ShipmentAddress