import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser'; 
import rateLimit from 'express-rate-limit';
import compression from "compression";
import router from './src/routes/route';

dotenv.config();
const app = express();
const port = process.env.PORT || 5051;


// Rate limiter 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST'], 
  allowedHeaders: [
    'Authorization',  
    'X-User-Role',    
    'Content-Type',   
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser()); 
app.use(express.json());
app.use(helmet());
app.use(limiter);
app.use(compression());


// Root route 
app.get('/api/v1', (req, res) => {
  res.send({ message: 'Welcome to API' });
});

app.use('/api/v1', router);
  
// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export default app;
