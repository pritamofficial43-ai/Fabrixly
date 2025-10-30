import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Stripe from "stripe";
import OpenAI from "openai";
import { postToSocialPlatforms } from "./utils/socialPoster.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// health
app.get("/", (req, res) => {
  res.send("✅ Fabrixly Backend is running!");
});

// AI design (image) endpoint
app.post("/design/create", async (req, res) => {
  try {
    const prompt = req.body.prompt || "Modern AI Fashion Design";
    if (!openai) {
      // placeholder image if OpenAI not configured
      return res.json({ image: "https://via.placeholder.com/1024x1024.png?text=Fabrixly+Sample" });
    }
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024"
    });
    // result.data may contain url or b64_json depending on SDK/response
    const url = result?.data?.[0]?.url || (result?.data?.[0]?.b64_json ? `data:image/png;base64,${result.data[0].b64_json}` : null);
    res.json({ image: url });
  } catch (err) {
    console.error("design/create err:", err?.message || err);
    res.status(500).json({ error: err?.message || String(err) });
  }
});

// Stripe payment intent
app.post("/payment/create", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"]
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("payment/create err:", err?.message || err);
    res.status(500).json({ error: err?.message || String(err) });
  }
});

// Social poster endpoint (manual trigger)
app.post("/social/post", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });
    await postToSocialPlatforms(message);
    res.json({ success: true });
  } catch (err) {
    console.error("social/post err:", err?.message || err);
    res.status(500).json({ error: err?.message || String(err) });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


