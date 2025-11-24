import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import apiRoutes from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();

const corsOptions = {
  origin: "http://localhost:3001",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use("/api/v1", apiRoutes);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Made Some Changes :D
// Changes
export default app;
