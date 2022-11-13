import { Transform } from "node:stream";

const ONE_SECOND = 1000;

export default class ThrottleRequest extends Transform {
  #requestsPerSecond = 9;
  #internalCounter = 1;
  constructor({ objectMode, requestsPerSecond }) {
    super({ objectMode });

    this.#requestsPerSecond = requestsPerSecond;
  }
  _transform(chunk, encoding, callback) {
    this.#internalCounter++;
    if (!(this.#internalCounter >= this.#requestsPerSecond)) {
      //   this.push(chunk);
      return callback(null, chunk);
    }

    setTimeout(() => {
      this.#internalCounter = 1;
      //   this.push(chunk);
      return callback(null, chunk);
    }, ONE_SECOND);
  }
}
