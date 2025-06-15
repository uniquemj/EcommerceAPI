import { inject, injectable } from "tsyringe";
import { ShipmentAddressRepository } from "../repository/shipmentAddress.repository";
import { paginationField } from "../types/pagination.types";
import { ShipmentAddressRepositoryInterface } from "../types/repository.types";
import { ShipmentInfo, ShipmentInputInfo } from "../types/shipment.types";
import createHttpError from "../utils/httperror.utils";

@injectable()
export class ShipmentAddressServices {

    constructor(@inject('ShipmentAddressRepositoryInterface') private readonly shipmentAddressRepository: ShipmentAddressRepositoryInterface) { }

    async getShipmentAddressList(customer_id: string, pagination: paginationField) {
        const shipmentAddresses = await this.shipmentAddressRepository.getShipmentAddressList(customer_id, pagination)
        const count = await this.shipmentAddressRepository.getShipmentCount({customer_id: customer_id})
        return {count, shipmentAddresses}
    }

    async getShipmentAddressById(shipping_id: string) {
        const addressExist = await this.shipmentAddressRepository.getShipmentAddressById(shipping_id)
        if (!addressExist) {
            throw createHttpError.NotFound("Shipping Address with Id not found.")
        }
        return addressExist
    }

    async createShipmentAddress(deliveryInfo: ShipmentInfo, customer_id: string) {
        const customerAddressList = await this.getShipmentAddressList(customer_id, {page: 0, limit: 0})

        const { full_name, email, phone_number, region, city, address } = deliveryInfo

        let shipmentInfo: ShipmentInputInfo = {
            customer_id: customer_id,
            full_name,
            email,
            phone_number,
            region,
            city,
            address
        }

        if(customerAddressList.shipmentAddresses.length > 0){
            shipmentInfo.isDefault = false
            shipmentInfo.isActive = false
        }else{
            shipmentInfo.isDefault = true
            shipmentInfo.isActive = true
        }

        const result = await this.shipmentAddressRepository.createShipmentAddress(shipmentInfo)
        return result
    }

    async updateShipmentAddress(addressId: string, updateAddressInfo: Partial<ShipmentInputInfo>) {
        const addressExist = await this.shipmentAddressRepository.getShipmentAddressById(addressId)
        if (!addressExist) {
            throw createHttpError.NotFound("Address of Id doesn't exist.")
        }
        const result = await this.shipmentAddressRepository.updateShipmentAddress(addressId, updateAddressInfo)
        return result
    }

    async deleteShipmentAddress(addressId: string, customer_id: string) {
        const addressExist = await this.shipmentAddressRepository.getShipmentAddressById(addressId)
        if (!addressExist) {
            throw createHttpError.NotFound("Address of Id doesn't exist.")
        }
        const result = await this.shipmentAddressRepository.deleteShipmentAddress(addressId)
        return result
    }

    async getDefaultShipmentAddress(customer_id: string){
        const result = await this.shipmentAddressRepository.getDefaultShipmentAddress(customer_id)
        return result
    }
    
    async getActiveShipmentAddress(customer_id: string){
        const result = await this.shipmentAddressRepository.getActiveShipmentAddress(customer_id)
        return result
    }

    async updateActiveShipmentAddress(addressId: string, updateAddressInfo: Partial<ShipmentInputInfo>, customer: string) {
        const addressExist = await this.getActiveShipmentAddress(customer)
        if (addressExist?._id != addressId) {
            await this.shipmentAddressRepository.updateShipmentAddress(addressExist?._id as string, {isActive: false})
        }
        const result = await this.shipmentAddressRepository.updateShipmentAddress(addressId, updateAddressInfo)
        return result
    }
}