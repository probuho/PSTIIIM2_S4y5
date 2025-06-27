import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import router from "./routes";

dotenv.config();

const { API_PORT } = process.env;

const app = express();
app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(router);

app.listen(Number(API_PORT) || 4001, "0.0.0.0", () => {
  console.log(`Server running on port ${API_PORT}`);
});
