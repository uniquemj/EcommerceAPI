import { Response, Router } from "express";
import { ShipmentAddressServices } from "../services/shipmentAddress.services";
import { allowedRole } from "../middlewares/role.middleware";
import { AuthRequest } from "../types/auth.types";
import createHttpError from "../utils/httperror.utils";
import { ShipmentInfo } from "../types/shipment.types";
import { validate } from "../middlewares/validation.middleware";
import { addressSchema, updateAddressSchema } from "../validation/address.validate";
import { handleSuccessResponse } from "../utils/httpresponse.utils";
import Logger from "../utils/logger.utils";
import winston from 'winston';

export class ShipmentAddressController{
    readonly router: Router;
    private static instance: ShipmentAddressController
    private readonly logger: winston.Logger

    private constructor(private readonly shipmentAddressServices: ShipmentAddressServices, logger: Logger){
        this.router = Router()
        this.logger = logger.logger()
    }

    static initController(shipmentAddressServices: ShipmentAddressServices, logger: Logger){
        if(!ShipmentAddressController.instance){
            ShipmentAddressController.instance = new ShipmentAddressController(shipmentAddressServices, logger)
        }
        
        const instance = ShipmentAddressController.instance

        instance.router.get('/', allowedRole('customer'), instance.getShipmentAddressList)
        instance.router.get('/:id', allowedRole('customer'), instance.getShipmentAddressById)
        instance.router.post('/', allowedRole('customer'), validate(addressSchema),instance.createShipmentAddress)
        instance.router.put('/:id', allowedRole('customer'), validate(updateAddressSchema), instance.editShipmentAddress)
        instance.router.delete('/:id', allowedRole('customer'), instance.deleteShipmentAddress)

        return instance
    }

    getShipmentAddressList = async(req: AuthRequest, res: Response) =>{
        try{
            const userId = req.user?._id as string
            const result = await this.shipmentAddressServices.getShipmentAddressList(userId)
            handleSuccessResponse(res, "Shipment Address Fetched.", result)
        }catch(e: any){
            this.logger.error("Error while fetching shipment address list.")
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getShipmentAddressById = async(req: AuthRequest, res: Response) =>{
        try{
            const addressId = req.params.id
            const result = await this.shipmentAddressServices.getShipmentAddressById(addressId)
            handleSuccessResponse(res, "Shipment Address Detail Fetched.", result)
        }catch(e:any){
            this.logger.error("Error while fetching shipment address detail.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    createShipmentAddress = async(req: AuthRequest, res: Response) =>{
        try{
            const deliveryInfo = req.body as ShipmentInfo
            const customer_id = req.user?._id as string

            const result = await this.shipmentAddressServices.createShipmentAddress(deliveryInfo, customer_id)
            handleSuccessResponse(res, "Shipment Address Created.", result)
        }catch(e: any){
            this.logger.error("Error while creating shipment address.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    editShipmentAddress = async(req: AuthRequest, res: Response) =>{
        try{
            const addressId = req.params.id
            const updateAddressInfo = req.body
            const customer_id = req.user?._id as string

            const result = await this.shipmentAddressServices.updateShipmentAddress(addressId, updateAddressInfo, customer_id)
            handleSuccessResponse(res, "Shipment Address Updated.", result)
        }catch(e:any){
            this.logger.error("Error while updating shipment Address.",{object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    deleteShipmentAddress = async(req: AuthRequest, res: Response) =>{
        try{
            const addressId = req.params.id
            const customer_id = req.user?._id as string

            const result = await this.shipmentAddressServices.deleteShipmentAddress(addressId, customer_id)
            handleSuccessResponse(res, "Shipment Address Deleted.",result)
        }catch(e:any){
            this.logger.error("Error while deleting Shipment Address.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}