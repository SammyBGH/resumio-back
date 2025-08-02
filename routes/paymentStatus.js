const express = require("express");
const Resume = require("../models/Resume");
const router = express.Router();

// ✅ Check payment status for a given resume
router.get("/payment-status/:resumeId", async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    // Return payment status
    res.json({
      success: true,
      paid: resume.paymentStatus === "success",
      status: resume.paymentStatus
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
