
import { injectable } from "tsyringe";
import Product from "../model/product.model";
import { paginationField } from "../types/pagination.types";
import { ArchieveStatus, CountFilter, ProductFilter, ProductInfo, ProductInputInfo, searchFilter } from "../types/product.types";
import { ProductRepositoryInterface } from "../types/repository.types";
import { Types } from "mongoose";
import Variant from "../model/variant.model";

@injectable()
export class ProductRepository implements ProductRepositoryInterface {
    private categoryPopulate = { path: "category", select: '-__v', populate: { path: "parent_category" } }
    private defaultVariantPopulate = { path: "defaultVariant", populate: [{ path: 'product', select: '_id name' }, { path: 'images', select: '_id url' }] }

    async getAllProducts(pagination: paginationField, query: ProductFilter): Promise<ProductInfo[]> {
        return await Product.find({ isActive: true, ...query })
            .limit(pagination.limit)
            .skip((pagination.page - 1) * pagination.limit)
            .populate(this.categoryPopulate)
            .populate('seller', '_id, store_name').populate(this.defaultVariantPopulate)
    }
    async getProductCount(): Promise<number> {
        return await Product.find({ isActive: true}).countDocuments()
    }



    async getProductList(pagination: paginationField): Promise<ProductInfo[]> {
        return await Product.find({ isActive: true, archieveStatus: ArchieveStatus.UnArchieve })
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .populate('category', '-__v')
            .populate({ path: 'variants', select: '-__v', match: { 'availability': true } })
            .populate('seller', '_id, store_name')
            .populate(this.defaultVariantPopulate)
            .populate({ path: 'variants', populate: [{ path: 'product', select: '_id name' }, { path: 'images', select: '_id url' }] })
            .select('-isActive -archieveStatus')
    }

    async getProductCounts(query: CountFilter): Promise<number> {
        return await Product.countDocuments({ isActive: true, ...query })
    }

    async getProductById(id: string): Promise<ProductInfo | null> {
        return await Product.findById(id)
            .populate('category', '-__v')
            .populate({ path: 'variants', populate: [{ path: 'product', select: '_id name' }, { path: 'images', select: '_id url' }] })
            .populate('seller', '_id, store_name')
            .select('-isActive')
    }

    async getSellerProductList(sellerId: string, pagination: paginationField, query: ProductFilter): Promise<ProductInfo[]> {
        return await Product.find({ seller: sellerId, isActive: true, ...query })
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .populate('category', '-__v')
            .populate('seller', '_id, store_name')
            .populate(this.defaultVariantPopulate)
            .populate({ path: 'variants', populate: [{ path: 'product', select: '_id name' }, { path: 'images', select: '_id url' }] })
            .select('-isActive')
            .sort('-createdAt')
    }

    async getSellerProductById(id: string, userId: string): Promise<ProductInfo | null> {
        return await Product.findOne({ _id: id, seller: userId })
            .populate('category', '-__v')
            .populate({ path: 'variants', populate: [{ path: 'product', select: '_id name' }, { path: 'images', select: '_id url' }] })
            .populate('seller', '_id, store_name')
            .select('-isActive')
    }

    async getProductByCategory(categoryId: string, pagination: paginationField): Promise<ProductInfo[]> {
        return await Product.find({ isActive: true, archieveStatus: ArchieveStatus.UnArchieve, category: categoryId })
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .populate('category', '-__v')
            .populate({ path: 'variants', select: '-__v', match: { 'availability': true } })
            .populate('seller', '_id, store_name')
            .populate(this.defaultVariantPopulate)
            .populate({ path: 'variants', populate: [{ path: 'product', select: '_id name' }, { path: 'images', select: '_id url' }] })
            .select('-isActive -archieveStatus')
    }


    // async searchProduct(searchFilter: searchFilter): Promise<{ products: ProductInfo[], total: number }> {
    //     const { keyword, category, minPrice, maxPrice, page, limit, sortBy } = searchFilter;
    //     console.log(keyword, category)
    //     const pipeline: any[] = [];

    //     pipeline.push({
    //         $match: {
    //             "archieveStatus": ArchieveStatus.UnArchieve
    //         }
    //     });

    //     if (keyword) {
    //         pipeline.push({
    //             $lookup: {
    //                 from: 'categories',
    //                 localField: 'category',
    //                 foreignField: '_id',
    //                 as: 'category'
    //             }
    //         });
    //         pipeline.push({ $unwind: '$category' });

    //         pipeline.push({
    //             $lookup: {
    //                 from: 'categories',
    //                 localField: 'category.parent_category',
    //                 foreignField: '_id',
    //                 as: 'parent_category',
    //             }
    //         });
    //         pipeline.push({ $unwind: { path: '$parent_category', preserveNullAndEmptyArrays: true } });

    //         pipeline.push({
    //             $match: {
    //                 $or: [
    //                     { "name": { $regex: keyword, $options: 'i' } },
    //                     { "description": { $regex: keyword, $options: 'i' } },
    //                     { 'category.title': { $regex: keyword, $options: 'i' } },
    //                     { 'parent_category.title': { $regex: keyword, $options: 'i' } }
    //                 ]
    //             }
    //         });
    //     }

    //     pipeline.push(
    //         {
    //             $lookup: {
    //                 from: 'variants',
    //                 localField: 'variants',
    //                 foreignField: '_id',
    //                 as: 'variants',
    //             }
    //         },
    //         { $unwind: '$variants' },
    //         {
    //             $lookup: {
    //                 from: 'files',
    //                 localField: 'variants.images',
    //                 foreignField: '_id',
    //                 as: 'variants.images',
    //             }
    //         },
    //         {
    //             $group: {
    //                 _id: '$_id',
    //                 name: { $first: '$name' },
    //                 description: { $first: '$description' },
    //                 category: { $first: '$category' },
    //                 defaultVariant: { $first: '$defaultVariant' },
    //                 createdAt: { $first: '$createdAt' },
    //                 variants: { $push: '$variants' },
    //             },
    //         }
    //     );

    //     // Variant Filter
    //     const variantMatch: Record<string, any> = {};

    //     if (minPrice && minPrice !== undefined) {
    //         variantMatch['variants.price'] = { $gte: minPrice };
    //     }

    //     if (maxPrice && maxPrice !== undefined) {
    //         variantMatch['variants.price'] = {
    //             ...(variantMatch['variants.price'] || []),
    //             $lte: maxPrice
    //         };
    //     }

    //     if (Object.keys(variantMatch).length) {
    //         pipeline.push({ $match: variantMatch });
    //     }

    //     // Only do category-specific filtering if category is provided separately from keyword
    //     if (category && !keyword) {
    //         pipeline.push(
    //             {
    //                 $lookup: {
    //                     from: 'categories',
    //                     localField: 'category',
    //                     foreignField: '_id',
    //                     as: 'category'
    //                 }
    //             },
    //             { $unwind: '$category' },
    //             {
    //                 $lookup: {
    //                     from: 'categories',
    //                     localField: 'category.parent_category',
    //                     foreignField: '_id',
    //                     as: 'parent_category',
    //                 }
    //             },
    //             { $unwind: { path: '$parent_category', preserveNullAndEmptyArrays: true } },
    //             {
    //                 $match: {
    //                     $or: [
    //                         { 'category.title': { $regex: category, $options: 'i' } },
    //                         { 'parent_category.title': { $regex: category, $options: 'i' } }
    //                     ]
    //                 }
    //             }
    //         );
    //     }

    //     pipeline.push(
    //         {
    //             $lookup: {
    //                 from: 'variants',
    //                 localField: 'defaultVariant',
    //                 foreignField: '_id',
    //                 as: 'defaultVariant',
    //             },
    //         },
    //         { $unwind: '$defaultVariant' },
    //         {
    //             $lookup: {
    //                 from: 'files',
    //                 localField: 'defaultVariant.images',
    //                 foreignField: '_id',
    //                 as: 'defaultVariant.images',
    //             }
    //         },
    //         { $unwind: '$defaultVariant.images' },
    //     );


    //     pipeline.push(
    //         {
    //             $lookup: {
    //                 from: 'categories',
    //                 localField: 'category',
    //                 foreignField: '_id',
    //                 as: 'category'
    //             }
    //         },
    //         { $unwind: '$category' },
    //         {
    //             $lookup: {
    //                 from: 'categories',
    //                 localField: 'category.parent_category',
    //                 foreignField: '_id',
    //                 as: 'parent_category'
    //             }
    //         },
    //         { $unwind: { path: '$parent_category', preserveNullAndEmptyArrays: true } }
    //     );

    //     const offset = (page! - 1) * limit!;

    //     pipeline.push(
    //         { $skip: offset },
    //         { $limit: limit }
    //     );

    //     const allowedSortKeys = ['createdAt', '-createdAt'];
    //     const safeSort = allowedSortKeys.includes(sortBy as string) ? sortBy : '-createdAt';

    //     const sortKey = safeSort?.replace('-', '');
    //     const sortOrder = safeSort?.startsWith('-') ? -1 : 1;

    //     pipeline.push({
    //         $sort: {
    //             [sortKey as string]: sortOrder,
    //         }
    //     });



    //     pipeline.push(
    //         {
    //             $project: {
    //                 name: 1,
    //                 category: 1,
    //                 seller: 1,
    //                 variants: 1,
    //                 productDescription: 1,
    //                 productHightlights: 1,
    //                 defaultVariant: 1
    //             }
    //         }
    //     );

    //     const [products, total] = await Promise.all([
    //         Product.aggregate(pipeline),
    //         Product.aggregate([
    //             ...pipeline.filter((stage) => !['$skip', '$limit'].includes(Object.keys(stage)[0])),
    //             { $count: 'total' },
    //         ])
    //     ]);
    //     console.log(products)
    //     const count = total.length > 0 ? total[0].total : 0;
    //     return { products, total: count };
    // }

    async searchProduct(searchFilter: searchFilter): Promise<{ products: ProductInfo[], total: number }> {
    const { keyword, category, minPrice, maxPrice, page, limit, sortBy } = searchFilter;
    
    const pipeline: any[] = [
        // Initial match for unarchived products
        {
            $match: {
                "archieveStatus": ArchieveStatus.UnArchieve
            }
        },
        
        // Lookup category and parent category once at the beginning
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }
        },
        { $unwind: '$category' },
        {
            $lookup: {
                from: 'categories',
                localField: 'category.parent_category',
                foreignField: '_id',
                as: 'parent_category',
            }
        },
        { $unwind: { path: '$parent_category', preserveNullAndEmptyArrays: true } },
        
        // Combined keyword and category matching
        // {
        //     $match: {
        //         $and: [
        //             // Only apply keyword filter if keyword exists
        //             ...(keyword ? [{
        //                 $or: [
        //                     { "name": { $regex: keyword, $options: 'i' } },
        //                     { "description": { $regex: keyword, $options: 'i' } },
        //                     { 'category.title': { $regex: keyword, $options: 'i' } },
        //                     { 'parent_category.title': { $regex: keyword, $options: 'i' } }
        //                 ]
        //             }] : []),
        //             // Only apply category filter if category exists
        //             ...(category ? [{
        //                 $or: [
        //                     { 'category.title': { $regex: category, $options: 'i' } },
        //                     { 'parent_category.title': { $regex: category, $options: 'i' } }
        //                 ]
        //             }] : [])
        //         ].filter(Boolean) // Remove empty conditions
        //     }
        // },

        {
    $match: {
        ...(keyword || category ? {
            $and: [
                // Only apply keyword filter if keyword exists
                ...(keyword ? [{
                    $or: [
                        { "name": { $regex: keyword, $options: 'i' } },
                        { "description": { $regex: keyword, $options: 'i' } },
                        { 'category.title': { $regex: keyword, $options: 'i' } },
                        { 'parent_category.title': { $regex: keyword, $options: 'i' } }
                    ]
                }] : []),
                // Only apply category filter if category exists
                ...(category ? [{
                    $or: [
                        { 'category.title': { $regex: category, $options: 'i' } },
                        { 'parent_category.title': { $regex: category, $options: 'i' } }
                    ]
                }] : [])
            ].filter(Boolean) // Remove empty conditions
        } : {}) // Empty object when no filters
    }
},
        
        // Variant processing
        {
            $lookup: {
                from: 'variants',
                localField: 'variants',
                foreignField: '_id',
                as: 'variants',
            }
        },
        { $unwind: '$variants' },
        {
            $lookup: {
                from: 'files',
                localField: 'variants.images',
                foreignField: '_id',
                as: 'variants.images',
            }
        },
        {
            $group: {
                _id: '$_id',
                name: { $first: '$name' },
                description: { $first: '$description' },
                category: { $first: '$category' },
                parent_category: { $first: '$parent_category' },
                defaultVariant: { $first: '$defaultVariant' },
                createdAt: { $first: '$createdAt' },
                variants: { $push: '$variants' },
            }
        },
        
        // Price filtering
        ...(minPrice || maxPrice ? [{
            $match: {
                'variants.price': {
                    ...(minPrice ? { $gte: minPrice } : {}),
                    ...(maxPrice ? { $lte: maxPrice } : {})
                }
            }
        }] : []),
        
        // Default variant processing
        {
            $lookup: {
                from: 'variants',
                localField: 'defaultVariant',
                foreignField: '_id',
                as: 'defaultVariant',
            }
        },
        { $unwind: '$defaultVariant' },
        {
            $lookup: {
                from: 'files',
                localField: 'defaultVariant.images',
                foreignField: '_id',
                as: 'defaultVariant.images',
            }
        },
        { $unwind: '$defaultVariant.images' }
    ];
    
    // Count total before pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const total = await Product.aggregate(countPipeline);
    const count = total.length > 0 ? total[0].total : 0;
    
    // Add sorting
    const allowedSortKeys = ['createdAt', '-createdAt'];
    const safeSort = allowedSortKeys.includes(sortBy as string) ? sortBy : '-createdAt';
    const sortKey = safeSort?.replace('-', '');
    const sortOrder = safeSort?.startsWith('-') ? -1 : 1;
    
    pipeline.push({
        $sort: {
            [sortKey as string]: sortOrder,
        }
    });
    
    // Add pagination
    const offset = (page! - 1) * limit!;
    pipeline.push(
        { $skip: offset },
        { $limit: limit }
    );
    
    // Projection
    pipeline.push({
        $project: {
            name: 1,
            category: 1,
            seller: 1,
            variants: 1,
            productDescription: 1,
            productHightlights: 1,
            defaultVariant: 1
        }
    });
    
    const products = await Product.aggregate(pipeline);
    return { products, total: count };
}
    async createProduct(productInfo: Partial<ProductInputInfo>): Promise<ProductInfo> {
        const product = await Product.create(productInfo)
        return product
    }

    async editProduct(productId: string, productInfo: Partial<ProductInputInfo>): Promise<ProductInfo | null> {
        return await Product.findOneAndUpdate({ _id: productId }, productInfo, { new: true })
            .select('-isActive')
    }

    async removeProduct(productId: string): Promise<ProductInfo | null> {
        return await Product.findOneAndDelete({ _id: productId })
            .select('-isActive')
    }

    async removeCategoryFromProduct(productId: string, categoryId: string, userId: string): Promise<ProductInfo | null> {
        return await Product.findOneAndUpdate(
            { _id: productId, seller: userId },
            { $pull: { category: categoryId } },
            { new: true }
        ).select('-isActive')
    }

    async removeVariant(productId: string, variantId: string): Promise<ProductInfo | null> {
        return await Product.findOneAndUpdate(
            { _id: productId },
            { $pull: { variant: variantId } },
            { new: true }
        ).select('-isActive')
    }

    async updateProductSellCount(productId: string, quantity: number): Promise<ProductInfo | null> {
        return await Product.findOneAndUpdate(
            { _id: productId },
            { $inc: { 'sellCount': quantity } }
        )
    }

    async getBestSellProduct(query: Partial<searchFilter>): Promise<ProductInfo[]> {
        return await Product.find({ 'sellCount': { $gte: 10 }, isActive: true, archieveStatus: ArchieveStatus.UnArchieve }).limit(query.limit as number)
            .skip((query.page as number - 1) * (query.limit as number))
            .sort(query.sortBy as string)
            .populate(this.categoryPopulate)
            .populate('seller', '_id, store_name').populate(this.defaultVariantPopulate)
    }

    async getSellerBestSellProduct(sellerId: string, query: searchFilter): Promise<ProductInfo[]> {
        return await Product.find({ seller: sellerId, sellCount: { $gte: 10 } }).limit(query.limit as number)
            .skip((query.page as number - 1) * (query.limit as number))
            .populate(this.categoryPopulate)
            .populate('seller', '_id, store_name').populate(this.defaultVariantPopulate)
    }

    async getFeaturedProduct(pagination: paginationField): Promise<ProductInfo[]> {
        return await Product.find({ featured: true, isActive: true, archieveStatus: ArchieveStatus.UnArchieve }).limit(pagination.limit)
            .skip((pagination.page - 1) * pagination.limit)
            .populate(this.categoryPopulate)
            .populate('seller', '_id, store_name').populate(this.defaultVariantPopulate)
    }

    async getTotalSale(sellerId: string): Promise<number> {
        const result = await Product.aggregate([
            {
                $match: {
                    "seller": new Types.ObjectId(sellerId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalSale: { $sum: '$sellCount' }
                }
            }
        ])
        return result[0]?.totalSale || 0
    }
}