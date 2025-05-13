import {Schema, Model, model, Document} from 'mongoose';
import { FileType } from '../types/file.types';

interface FileDocument extends Document{
    _id: string,
    original_name: string,
    type: FileType
    size: number,
    blob_path: string,
    url: string
}

const fileSchema: Schema<FileDocument> = new Schema({
    original_name: {type: String, required: true},
    type: {type: String, enum: Object.values(FileType)},
    size: {type: Number, required: true},
    blob_path: {type: String, required: true},
    url: {type: String, required: true}
},{timestamps: true})

const File: Model<FileDocument> = model('file', fileSchema)

export default File