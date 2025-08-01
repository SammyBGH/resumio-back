const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./middlewares/passport');
const summarizeRoute = require('./routes/summarize');
const authRoute = require('./routes/auth');
const path = require('path');

dotenv.config();

const app = express();

// ✅ Allowed origins (local + deployed frontend)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://resumio-five.vercel.app'
];

// ✅ Middlewares
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.JWT_SECRET || 'secret123',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // true only on HTTPS
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use('/api/summarize', summarizeRoute);
app.use('/auth', authRoute);

// ✅ Default route
app.get('/', (req, res) => {
  res.send('✅ Server is running on Render...');
});

// ✅ Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

// ✅ Server (Render uses process.env.PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
