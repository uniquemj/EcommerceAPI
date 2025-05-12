import ShipmentAddress from "../model/shippingAddress.model";
import { paginationField } from "../types/pagination.types";
import { ShipmentAddressRepositoryInterface } from "../types/repository.types";
import { ShipmentInfo, ShipmentInputInfo } from "../types/shipment.types";

export class ShipmentAddressRepository implements ShipmentAddressRepositoryInterface{

    async createShipmentAddress(shipmentInfo: ShipmentInputInfo): Promise<ShipmentInfo>{
        return await ShipmentAddress.create(shipmentInfo)
    }

    async getShipmentCount(): Promise<number>{
        return await ShipmentAddress.countDocuments()
    }

    async getShipmentAddressList(customerId: string, pagination: paginationField): Promise<ShipmentInfo[]>{
        return await ShipmentAddress.find({customer_id: customerId})
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit)
    }

    async getShipmentAddressById(addressId: string): Promise<ShipmentInfo|null>{
        return await ShipmentAddress.findOne({_id: addressId})
    }

    async updateShipmentAddress(addressId: string, updateAddressInfo: Partial<ShipmentInputInfo>): Promise<ShipmentInfo | null>{
        return await ShipmentAddress.findByIdAndUpdate(addressId, updateAddressInfo, {new: true})
    }

    async deleteShipmentAddress(addressId: string): Promise<ShipmentInfo | null>{
        return await ShipmentAddress.findByIdAndDelete(addressId)
    }
}