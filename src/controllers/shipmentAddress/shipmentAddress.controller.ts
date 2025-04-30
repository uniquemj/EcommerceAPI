import { Response, Router } from "express";
import { ShipmentAddressServices } from "../../services/shipmentAddress/shipmentAddress.services";
import { allowedRole } from "../../middlewares/role.middleware";
import { AuthRequest } from "../../types/auth.types";
import createHttpError from "../../utils/httperror.utils";
import { ShipmentInfo } from "../../types/shipment.types";
import { validate } from "../../middlewares/validation.middleware";
import { addressSchema, updateAddressSchema } from "../../validation/address.validate";
import { handleSuccessResponse } from "../../utils/httpresponse.utils";

export class ShipmentAddressController{
    readonly router: Router;
    private static instance: ShipmentAddressController
    
    private constructor(private readonly shipmentAddressServices: ShipmentAddressServices){
        this.router = Router()
    }

    static initController(shipmentAddressServices: ShipmentAddressServices){
        const instance = new ShipmentAddressController(shipmentAddressServices)
        ShipmentAddressController.instance = instance

        instance.router.get('/', allowedRole('customer'), instance.getShipmentAddressListOfCustomer)
        instance.router.post('/', allowedRole('customer'), validate(addressSchema),instance.createShipmentAddress)
        instance.router.put('/:id', allowedRole('customer'), validate(updateAddressSchema), instance.editShipmentAddress)
        instance.router.delete('/:id', allowedRole('customer'), instance.deleteShipmentAddress)

        return instance
    }

    getShipmentAddressListOfCustomer = async(req: AuthRequest, res: Response) =>{
        try{
            const userId = req.user?._id as string
            const result = await this.shipmentAddressServices.getShipmentAddressListOfCustomer(userId)
            handleSuccessResponse(res, "Shipment Address Fetched.", result)
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    createShipmentAddress = async(req: AuthRequest, res: Response) =>{
        try{
            const deliveryInfo = req.body as ShipmentInfo
            const customer_id = req.user?._id as string

            const result = await this.shipmentAddressServices.createShipmentAddress(deliveryInfo, customer_id)
            handleSuccessResponse(res, "Shipement Address Created.", result)
        }catch(e: any){
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
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}