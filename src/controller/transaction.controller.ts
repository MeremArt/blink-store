import { Request, Response } from "express";
import { getTransactions } from "../services/transanction.service";

export const getTransactionsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { publicKey, numTx } = req.body;

    // Validate inputs
    if (!publicKey || !numTx) {
      res.status(400).json({ error: "Public key and numTx are required" });
      return;
    }

    // Call the service to get the transaction details
    const transactions = await getTransactions(publicKey, numTx);

    // Return the transactions as a response
    res.json({ transactions });
  } catch (error: any) {
    console.error("Error in controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
