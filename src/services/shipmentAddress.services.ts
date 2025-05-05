import { ShipmentAddressRepository } from "../repository/shipmentAddress.repository";
import { ShipmentInfo } from "../types/shipment.types";
import createHttpError from "../utils/httperror.utils";


export class ShipmentAddressServices{
    
    constructor(private readonly shipmentAddressRepository: ShipmentAddressRepository){}

    async getShipmentAddressList(customer_id: string){
        try{
            const shipmentAddresses  = await this.shipmentAddressRepository.getShipmentAddressList(customer_id)
            return shipmentAddresses
        }catch(error){
            throw error
        }
    }

    async getShipmentAddressById(shipping_id: string){
        try{
            const addressExist = await this.shipmentAddressRepository.getShipmentAddressById(shipping_id)
            if(!addressExist){
                throw createHttpError.NotFound("Shipping Address with Id not found.")
            }
            return addressExist
        }catch(error){
            throw error
        }
    }

    async createShipmentAddress(deliveryInfo: ShipmentInfo, customer_id: string){
        try{
            const {full_name, email, phone_number, region, city, address} = deliveryInfo

            const shipmentInfo: ShipmentInfo = {
                customer_id: customer_id,
                full_name,
                email,
                phone_number,
                region,
                city,
                address
            }
            
            const result = await this.shipmentAddressRepository.createShipmentAddress(shipmentInfo)
            return result
        }catch(error){
            throw error
        }
    }

    async updateShipmentAddress(addressId: string, updateAddressInfo: ShipmentInfo, customer_id: string){
        try{
            const addressExist = await this.shipmentAddressRepository.getShipmentAddressById(addressId)
            if(!addressExist){
                throw createHttpError.NotFound("Address of Id doesn't exist.")
            }
            const result = await this.shipmentAddressRepository.updateShipmentAddress(addressId, updateAddressInfo)
            return result
        }catch(error){
            throw error
        }
    }

    async deleteShipmentAddress(addressId: string, customer_id: string){
        try{
            const addressExist = await this.shipmentAddressRepository.getShipmentAddressById(addressId)
            if(!addressExist){
                throw createHttpError.NotFound("Address of Id doesn't exist.")
            }
            const result = await this.shipmentAddressRepository.deleteShipmentAddress(addressId)
            return result
        }catch(error){
            throw error
        }
    }
}