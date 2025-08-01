const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const passport = require("passport");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🗄️ Temporary In-Memory DB
const users = [];

/**
 * ✅ Google Authentication (Token-based)
 * Endpoint: POST /auth/google
 */
router.post("/google", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "No Google token provided" });
  }

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Check if user already exists
    let user = users.find((u) => u.googleId === payload.sub);

    if (!user) {
      // New user
      user = {
        id: users.length + 1,
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture || "",
        formData: {},
      };
      users.push(user);
    } else {
      // Always refresh latest Google info
      user.picture = payload.picture || user.picture;
      user.name = payload.name || user.name;
    }

    // Generate session token
    const jwtToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture || "",
      },
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

/**
 * ✅ Popup-Based Google Authentication (OAuth)
 * Endpoint: GET /auth/google
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * ✅ Google OAuth Callback
 * Endpoint: GET /auth/google/callback
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: process.env.FRONTEND_URL }),
  (req, res) => {
    // Generate a JWT for the session
    const userProfile = req.user;

    // Check if user exists
    let user = users.find((u) => u.googleId === userProfile.id);

    if (!user) {
      user = {
        id: users.length + 1,
        googleId: userProfile.id,
        email: userProfile.email,
        name: userProfile.displayName,
        picture: userProfile.photo || "",
        formData: {},
      };
      users.push(user);
    }

    const jwtToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    // Redirect to frontend with token as query param
    res.redirect(
      `${process.env.FRONTEND_URL}/auth-success?token=${jwtToken}`
    );
  }
);

/**
 * ✅ Get logged-in user info
 * Endpoint: GET /auth/me
 */
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    const user = users.find((u) => u.id === decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture || "",
      },
    });
  } catch (err) {
    console.error("JWT Verification Error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
