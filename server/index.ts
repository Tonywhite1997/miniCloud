import path from "path";
import mongoose from "mongoose";
import { config } from "dotenv";
const app = require("./app");
const Folder = require("./models/folder");

config({ path: path.resolve(__dirname, ".env") });

const url: string | undefined = process.env.MONGO_URL;
const PORT: number = 5000;
const mongooseOptions: object = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true, // Recommended for index support
};

if (url) {
  mongoose
    .connect(url, mongooseOptions)
    .then(() => {
      console.log("connected to DB");
      app.listen(PORT, () => {
        console.log(`app is listening on port ${PORT}`);
      });
    })
    .catch((error) => console.log("error", error));
}
