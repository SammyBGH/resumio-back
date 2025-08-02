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
      const resumeId = data.metadata?.resumeId;

      if (resumeId) {
        await Resume.findByIdAndUpdate(resumeId, { paymentStatus: "success" });
      } else {
        console.warn("⚠️ No resumeId found in Paystack metadata.");
      }

      return res.json({ success: true, data });
    }

    res.json({ success: false, message: "Payment verification failed" });
  } catch (error) {
    console.error("❌ Payment verification error:", error.message);
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
    console.error("❌ Error fetching payment status:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
