const express = require("express");
const axios = require("axios");
const Resume = require("../models/Resume");
const router = express.Router();

router.get("/verify/:reference", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${req.params.reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, data } = response.data;

    if (status && data.status === "success") {
      // Optionally update resume paymentStatus here
      await Resume.findOneAndUpdate(
        { _id: data.metadata.resumeId },
        { paymentStatus: "success" }
      );
      return res.json({ success: true, data });
    }
    res.json({ success: false });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
