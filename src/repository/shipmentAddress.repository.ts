import ShipmentAddress from "../model/shippingAddress.model";
import { ShipmentInfo } from "../types/shipment.types";

export class ShipmentAddressRepository{

    async createShipmentAddress(shipmentInfo: ShipmentInfo){
        return await ShipmentAddress.create(shipmentInfo)
    }

    async getShipmentAddressList(customerId: string){
        return await ShipmentAddress.find({customer_id: customerId})
    }

    async getShipmentAddressById(addressId: string){
        return await ShipmentAddress.findOne({_id: addressId})
    }

    async updateShipmentAddress(addressId: string, updateAddressInfo: ShipmentInfo){
        return await ShipmentAddress.findByIdAndUpdate(addressId, updateAddressInfo, {new: true})
    }

    async deleteShipmentAddress(addressId: string){
        return await ShipmentAddress.findByIdAndDelete(addressId)
    }
}