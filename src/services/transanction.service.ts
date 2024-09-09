import {
  Connection,
  PublicKey,
  clusterApiUrl,
  ConfirmedSignatureInfo,
} from "@solana/web3.js";
import { TransactionInfo } from "../interface/transcation.interface";

const solanaConnection = new Connection(clusterApiUrl("mainnet-beta"));

export const getTransactions = async (
  publicKey: string,
  numTx: number
): Promise<TransactionInfo[]> => {
  try {
    const pubKey = new PublicKey(publicKey);

    // Fetch transaction signatures for the address
    const transactionList = await solanaConnection.getSignaturesForAddress(
      pubKey,
      { limit: numTx }
    );
    const transactions: TransactionInfo[] = [];

    for (const transaction of transactionList) {
      const date = new Date((transaction.blockTime || 0) * 1000);

      // Fetch transaction details to get the amount transferred
      const txDetails = await solanaConnection.getConfirmedTransaction(
        transaction.signature
      );
      const amount =
        (txDetails?.meta?.postBalances[0] || 0) -
        (txDetails?.meta?.preBalances[0] || 0);

      transactions.push({
        signature: transaction.signature,
        date: date.toISOString(),
        status: transaction.confirmationStatus || "unknown",
        amount: amount / 1e9, // Convert lamports to SOL
      });
    }

    return transactions;
  } catch (error) {
    console.error("Error fetching transactions from Solana:", error);
    throw new Error("Error fetching transactions from Solana.");
  }
};
