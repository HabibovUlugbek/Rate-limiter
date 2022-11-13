/*
curl -i \
-X POST \
--data '{"name":"John Doe", "age":27}' \
-H "Content-Type: application/json" \
http://localhost:3000
*
*/
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

import express from "express";
import bodyParser from "body-parser";
import { createWriteStream } from "node:fs";

const output = createWriteStream("output.ndjson");

const app = express();
app.use(bodyParser.json());
app.use(limiter);
const PORT = 3000;

app.post("/", async (req, res) => {
  console.log("received request", req.body);
  output.write(JSON.stringify(req.body) + "\n");
  return res.send("Ok!");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
