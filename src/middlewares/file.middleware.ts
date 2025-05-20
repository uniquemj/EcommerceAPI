import multer from 'multer'
import { FileFilterCallback } from 'multer'
import fs from 'fs'
import path from 'path'
import { getRandomId } from '../utils/helper.utils'

const date = new Date()
const FullDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname == 'variantImages') {
            const path = `./uploads/variants/${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
            fs.mkdirSync(path, { recursive: true })
            cb(null, path)
        } else if (file.fieldname == 'legal_document') {
            const path = `./uploads/legal_document/${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
            fs.mkdirSync(path, { recursive: true })
            cb(null, path)
        } else if(file.fieldname == 'store_logo'){
            const path = `./uploads/store_logo/${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
            fs.mkdirSync(path, { recursive: true })
            cb(null, path)
        }
    },
    filename: (req, file, cb) => {
        cb(null, getRandomId()+path.extname(file.originalname))
    }
})

const checkImage = (file: Express.Multer.File, cb: FileFilterCallback) => {
    const imageTypes = /.jpg|.jpeg|.png/
    const extname = imageTypes.test(path.extname(file.originalname).toLowerCase())
    if (extname) {
        return cb(null, true);
    } else {
        cb(new Error("Error: Invalid Image Type. Allowed images: .jpg, .jpeg, .png."));
    }
}

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        checkImage(file, cb)
    },
    limits: {
        fileSize: 1024 * 1024 * 10
    }
})

export default upload