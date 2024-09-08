import express from "express";
import { json } from "body-parser";
import {
  ActionPostResponse,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
} from "@solana/actions";
import {
  Authorized,
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  StakeProgram,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { DEFAULT_SOL_ADDRESS, DEFAULT_SOL_AMOUNT } from "./const";

const app = express();
app.use(json());

const ACTIONS_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

app.get("/api/actions/transfer-sol", async (req, res) => {
  try {
    const requestUrl = new URL(
      req.protocol + "://" + req.get("host") + req.originalUrl
    );
    const { toPubkey } = validatedQueryParams(requestUrl);

    const baseHref = new URL(
      `/api/actions/transfer-sol?to=${toPubkey.toBase58()}`,
      requestUrl.origin
    ).toString();

    const payload: ActionGetResponse = {
      title: "Ribh",
      icon: "https://res.cloudinary.com/dtfvdjvyr/image/upload/v1725398591/Screenshot_2024-09-03_at_22.21.50_nclxzj.png",
      description:
        "A better way to collect payments for SMEs in Emerging Markets",
      label: "Transfer", // this value will be ignored since `links.actions` exists
      links: {
        actions: [
          {
            label: "Buy for 0.1 SOL", // button text
            href: `${baseHref}&amount=${"0.1"}`,
          },
          {
            label: "Buy for 0.5 SOL", // button text
            href: `${baseHref}&amount=${"0.5"}`,
          },
          {
            label: "Buy for 1 SOL", // button text
            href: `${baseHref}&amount=${"1"}`,
          },
          {
            label: "Buy now", // button text
            href: `${baseHref}&amount={amount}`, // this href will have a text input
            parameters: [
              {
                name: "amount", // parameter name in the `href` above
                label: "Enter last price", // placeholder of the text input
                required: true,
              },
            ],
          },
        ],
      },
    };

    res.set(ACTIONS_CORS_HEADERS).json(payload);
  } catch (err) {
    console.error(err);
    let message = "An unknown error occurred";
    if (typeof err === "string") message = err;
    res.status(400).set(ACTIONS_CORS_HEADERS).send(message);
  }
});

app.options("/api/actions/transfer-sol", (req, res) => {
  res.set(ACTIONS_CORS_HEADERS).send();
});

app.post("/api/actions/transfer-sol", async (req, res) => {
  try {
    const requestUrl = new URL(
      req.protocol + "://" + req.get("host") + req.originalUrl
    );
    const { amount, toPubkey } = validatedQueryParams(requestUrl);

    const body: ActionPostRequest = req.body;

    // validate the client-provided input
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return res
        .status(400)
        .set(ACTIONS_CORS_HEADERS)
        .send('Invalid "account" provided');
    }

    const connection = new Connection(
      process.env.SOLANA_RPC || clusterApiUrl("devnet")
    );

    // ensure the receiving account will be rent-exempt
    const minimumBalance = await connection.getMinimumBalanceForRentExemption(
      0
    );
    if (amount * LAMPORTS_PER_SOL < minimumBalance) {
      throw `account may not be rent exempt: ${toPubkey.toBase58()}`;
    }

    const transaction = new Transaction();
    transaction.feePayer = account;

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: toPubkey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    // set the end user as the fee payer
    transaction.feePayer = account;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    transaction
      .serialize({
        requireAllSignatures: false,
        verifySignatures: true,
      })
      .toString("base64");

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: `Send ${amount} SOL to ${toPubkey.toBase58()}`,
      },
    });

    res.set(ACTIONS_CORS_HEADERS).json(payload);
  } catch (err) {
    console.error(err);
    let message = "An unknown error occurred";
    if (typeof err === "string") message = err;
    res.status(400).set(ACTIONS_CORS_HEADERS).send(message);
  }
});

function validatedQueryParams(requestUrl: any) {
  let toPubkey = DEFAULT_SOL_ADDRESS;
  let amount = DEFAULT_SOL_AMOUNT;

  try {
    if (requestUrl.searchParams.get("to")) {
      toPubkey = new PublicKey(requestUrl.searchParams.get("to"));
    }
  } catch (err) {
    throw "Invalid input query parameter: to";
  }

  try {
    if (requestUrl.searchParams.get("amount")) {
      amount = parseFloat(requestUrl.searchParams.get("amount"));
    }

    if (amount <= 0) throw "amount is too small";
  } catch (err) {
    throw "Invalid input query parameter: amount";
  }

  return {
    amount,
    toPubkey,
  };
}

const PORT = process.env.PORT || 9500;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
