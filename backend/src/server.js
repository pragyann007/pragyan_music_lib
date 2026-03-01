import express from 'express';
import cors from 'cors';
import audioRouter from './routes/ausio.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use("/api/audio",audioRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
