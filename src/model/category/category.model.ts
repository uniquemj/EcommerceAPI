import { Schema, Document, Model, model } from "mongoose";


interface CategoryDocument extends Document{
    title: string,
    parent_category: Schema.Types.ObjectId
}


const categorySchema: Schema<CategoryDocument> = new Schema({
    title: {type: String, minlength: 3},
    parent_category: {type: Schema.Types.ObjectId, ref: 'category'}
})

const Category : Model<CategoryDocument> = model('category', categorySchema)

export default Category