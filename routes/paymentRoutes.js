const express = require("express");
const axios = require("axios");
const Resume = require("../models/Resume");
const router = express.Router();

/**
 * ✅ Verify payment with Paystack (one-time after payment)
 */
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
      // Update resume payment status
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

/**
 * ✅ Check saved payment status (works on page refresh)
 */
router.get("/payment-status/:resumeId", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    return res.json({
      success: true,
      paid: resume.paymentStatus === "success",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
