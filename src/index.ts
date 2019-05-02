import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";

import api from "./api";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api", api);
app.listen(port, () => {
    console.log(`server started at http://localhost:${ port }`);
});
