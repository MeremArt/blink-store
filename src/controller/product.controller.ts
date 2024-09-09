import ProductService from "../services/product.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
const { create, getProduct, getProductbyQuery, getProductbyid } =
  new ProductService();

export default class ProductController {
  async createProduct(req: Request, res: Response) {
    try {
      const productcheck = await getProductbyQuery({ name: req.body.name });
      if (productcheck) {
        return res.status(StatusCodes.CONFLICT).send({
          success: false,
          message: "Product name already exists",
        });
      }

      const product = await create({
        ...req.body,
        merchantId: req.params.userId,
      });
    } catch (error) {}
  }

  async getProductbyid(req: Request, res: Response) {
    try {
    } catch (error) {}
  }
}
