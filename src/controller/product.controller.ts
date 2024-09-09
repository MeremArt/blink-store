import ProductService from "../services/product.service";
import { Request, Response } from "express";

const { create, getProduct, getProductbyQuery, getProductbyid } =
  new ProductService();

export default class ProductController {
  async createProduct(req: Request, res: Response) {
    try {
    } catch (error) {}
  }

  async getProductbyid(req: Request, res: Response) {
    try {
    } catch (error) {}
  }
}
