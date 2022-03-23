const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true }));

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ethSigUtil = require("@metamask/eth-sig-util");
const { default: axios } = require("axios");

admin.initializeApp();
const db = admin.firestore();

app.use((req, res, next) => {
  if (Object.keys(req.headers).includes("x-user-signature")) {
    try {
      const message = decodeURI(req.headers["x-user-message"]);
      const signature = decodeURI(req.headers["x-user-signature"]);

      let wallet = ethSigUtil.recoverPersonalSignature({
        data: message,
        signature: signature,
      });

      if (!wallet) {
        console.log("Unable to recover address.");
        req.wallet = null;
      } else {
        req.wallet = wallet.toLowerCase();
      }
    } catch (error) {
      console.warn(
        req.headers["x-user-message"],
        req.headers["x-user-signature"]
      );
      console.error(error);
      console.log("Unable to recover address.");
    }
  } else {
    req.wallet = null;
  }

  next();
});

app.get("/juniors/requests", async (req, res) => {
  const whitelist = [
    "0x7ab51dfe5d2efbd7d01237a84f153fd578563e4f",
    "0xb251ef5a3d35776931805eb54c73e07b5bec1632",
  ];

  if (!req.wallet || !whitelist.includes(req.wallet.toLowerCase())) {
    return res.status(403).end();
  } else {
    const snapshot = await db.collection("junior-requests").get();
    res.json(snapshot.docs.map((doc) => doc.data()));
  }
});

app.get("/used/parents", async (req, res) => {
  const snapshot = await db.collection("parents").get();
  res.json(snapshot.docs.map((doc) => doc.id));
});

app.get("/pending/requests", async (req, res) => {
  if (!req.wallet) {
    return res.status(403).end();
  } else {
    try {
      const snapshot = await db.collection("junior-requests").get();
      const juniorRequests = snapshot.docs.map((doc) => doc.data());

      res.json(
        juniorRequests.filter(
          (juniorRequest) =>
            juniorRequest.wallet.toLowerCase() === req.wallet.toLowerCase()
        )
      );
    } catch (error) {
      console.warn(error);
      res.status(500).send(error);
    }
  }
});

app.post("/juniors/request", async (req, res) => {
  if (!req.wallet) {
    return res.status(403).end();
  } else {
    try {
      const snapshot = await db.collection("parents").get();
      const usedElephants = snapshot.docs.map((doc) => doc.id);

      const nfts = (
        await axios.get(
          `https://deep-index.moralis.io/api/v2/${req.wallet}/nft/0xFE063cF67B1f05F7EaFe351e9a67a290f74dDA9B?chain=polygon&format=decimal`,
          {
            headers: {
              "X-API-Key": process.env.MORALIS_API_KEY,
            },
          }
        )
      ).data;

      if (nfts.total > 0) {
        const tokenIds = nfts.result.map((nft) => "#" + nft.token_id);

        for (const parent of req.body.parents) {
          if (!tokenIds.includes(parent) || usedElephants.includes(parent)) {
            return res.status(403).end();
          }
        }
      } else {
        return res.status(403).end();
      }
    } catch (error) {
      res.status(500).send(error);
    }

    try {
      for (const parent of req.body.parents) {
        await db.collection("parents").doc(parent).set({
          status: "used",
        });
      }

      await db.collection("junior-requests").add({
        parents: req.body.parents,
        fulfilled: false,
        wallet: req.wallet,
      });

      res.status(200).end();
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send(
          "Database request failed. Please try again later and write a mail to contact@cryptoelephants.club"
        );
    }
  }
});

exports.api = functions.https.onRequest(app);
