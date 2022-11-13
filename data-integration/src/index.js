/*
echo "id,name,desc, age" > data.csv
for i in `seq 1 5`; do node -e "process.stdout.write('$i,habibov,$i-habibov, 20\n'.repeat(1e5))" >> data.csv; done
*/

import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import csvtojson from "csvtojson";
import { randomUUID } from "node:crypto";
import { log, makeRequest } from "./util.js";
import { Transform } from "node:stream";
import ThrottleRequest from "./throttle.js";

const throotle = new ThrottleRequest({
  objectMode: true,
  requestsPerSecond: 10,
});

const dataProcessor = Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    const now = performance.now();
    const data = chunk.toString().replace(/\d/g, now);
    const jsonData = JSON.parse(data);
    jsonData.id = randomUUID();

    return callback(null, JSON.stringify(jsonData));
  },
});

await pipeline(
  createReadStream("data.csv"),
  csvtojson(),
  dataProcessor,
  throotle,
  async function* (source) {
    let counter = 0;
    for await (const chunk of source) {
      log(`processed ${++counter} records ... `);
      const status = await makeRequest(chunk);
      if (status !== 200) {
        throw new Error(`Request failed with status ${status}`);
      }
    }
  }
);
