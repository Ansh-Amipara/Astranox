import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ASTRANOX_VERSION } from '@astranox/shared';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: ASTRANOX_VERSION });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
