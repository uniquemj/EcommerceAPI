import { Schema, Document, Model, model } from "mongoose";


interface CategoryDocument extends Document{
    title: string
}


const categorySchema: Schema<CategoryDocument> = new Schema({
    title: {type: String, minlength: 3}
})

const Category : Model<CategoryDocument> = model('category', categorySchema)

export default Category