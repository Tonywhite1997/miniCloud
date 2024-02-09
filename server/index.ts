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

// Drop the unique index on the 'name' field in the 'folders' collection
// Folder.collection.dropIndex({ name: 1 }, (err, result) => {
//     if (err) {
//         console.error('Error dropping index:', err);
//     } else {
//         console.log('Index dropped successfully:', result);
//     }

//     // Close the MongoDB connection
//     mongoose.connection.close();
// });
