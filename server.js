const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('./middlewares/passport');
const summarizeRoute = require('./routes/summarize');
const authRoute = require('./routes/auth');
const resumeRoutes = require('./routes/resumeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const path = require('path');

dotenv.config();

const app = express();

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// ✅ Allowed origins (frontend only)
const allowedOrigins = [
  'http://localhost:5173',
  'https://resumio-five.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// ✅ CORS middleware (allow all Vercel preview URLs dynamically)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow server-to-server or tools (like Postman)

    if (
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) // ✅ Allow all Vercel preview deployments
    ) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked for origin: ${origin}`);
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ✅ Session configuration
app.use(session({
  secret: process.env.JWT_SECRET || 'secret123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use('/api/summarize', summarizeRoute);
app.use('/auth', authRoute);
app.use('/api/resumes', resumeRoutes);
app.use('/api/payments', paymentRoutes);

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('✅ Backend server is running on Render...');
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: 'Server error' });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
