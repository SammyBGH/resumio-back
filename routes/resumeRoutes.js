const express = require("express");
const jwt = require("jsonwebtoken");
const Resume = require("../models/Resume");
const router = express.Router();

// Middleware: check auth
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

// ✅ Save resume
router.post("/", authMiddleware, async (req, res) => {
  try {
    const resume = new Resume({
      userId: req.userId,
      data: req.body,
    });
    await resume.save();
    res.json({ success: true, resume });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get all resumes for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch resumes" });
  }
});

// ✅ Update payment status
router.patch("/:id/pay", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOne({ _id: id, userId: req.userId });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    resume.paymentStatus = "paid";
    await resume.save();

    res.json({ message: "Payment marked as successful", resume });
  } catch (err) {
    res.status(500).json({ message: "Failed to update payment status" });
  }
});

module.exports = router;
