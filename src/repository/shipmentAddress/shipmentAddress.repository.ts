import ShipmentAddress from "../../model/shippingAddress/shippingAddress.model";
import { ShipmentInfo } from "../../types/shipment.types";

export class ShipmentAddressRepository{

    async createShipmentAddress(shipmentInfo: ShipmentInfo){
        return await ShipmentAddress.create(shipmentInfo)
    }

    async getShipmentAddressForCustomer(customerId: string){
        return await ShipmentAddress.findOne({customer_id: customerId})
    }
}