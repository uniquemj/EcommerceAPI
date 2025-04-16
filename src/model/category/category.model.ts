import { Schema, Document, Model, model } from "mongoose";


interface CategoryDocument extends Document{
    name: string
}


const categorySchema: Schema<CategoryDocument> = new Schema({
    name: {type: String, minlength: 3}
})

const Category : Model<CategoryDocument> = model('category', categorySchema)

export default Category