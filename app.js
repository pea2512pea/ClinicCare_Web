import express from 'express';
import routes from './routes/index.js';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const app = express();
const PORT = process.env.FRONTEND_PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'))
axios.defaults.baseURL = process.env.BACKEND_URL || `http://localhost:${PORT}/api`;
routes(app);


async function start() {
  try {
    app.listen(PORT, () => {
      console.log(`Web server running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error(err)
  }
}

start()