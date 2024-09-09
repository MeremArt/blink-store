import { model, Schema } from "mongoose";

import { TProduct } from "../interface/product.interface";

const productSchema = new Schema<TProduct>(
  {
    merchantId: {
      type: String,
      required: true,
      ref: "profile",
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: false,
      min: 0,
    },
  },
  {
    strict: true,
    timestamps: true,
    versionKey: false,
  }
);

const Product = model<TProduct>("product", productSchema);
export default Product;
