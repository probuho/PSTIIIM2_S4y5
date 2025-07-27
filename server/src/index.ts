import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import router from "./routes";

dotenv.config();

// CAMBIO AQUÍ: Usar process.env.PORT en lugar de process.env.API_PORT
const PORT = process.env.PORT || 4001; 

const app = express();
app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(router);

// CAMBIO AQUÍ: Usar la constante PORT y solo el puerto (Render manejará el host)
app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

