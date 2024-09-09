import { TProduct } from "../interface/product.interface";
import Product from "../model/product.model";

export default class ProductService {
  async create(product: Partial<TProduct>) {
    return await Product.create(product);
  }

  async getProductbyid(id: string) {
    const product = await Product.findById(id);
    if (!product) throw new Error("invalid productID");
  }

  async getProductbyQuery(query: Partial<TProduct>) {
    const product = await Product.findOne(query);
    return product;
  }

  async getProduct(query: Partial<TProduct>) {
    const product = await Product.find(query);
    return product;
  }
}
