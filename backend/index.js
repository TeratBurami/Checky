import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import apiRoutes from "./apis/index.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());

app.use("/api/v1", apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
