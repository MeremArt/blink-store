import { StatusCodes } from "http-status-codes";
import CustomApiError from "./custom-api";

export default class NotFoundError extends CustomApiError {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}
