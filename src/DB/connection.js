import mongoose from "mongoose";
import { DB_URL_ATLAS } from "../../config/config.service.js";

async function testDBConnection() {
  try {
    await mongoose.connect(DB_URL_ATLAS);
    console.log("DB connected");
  } catch (error) {
    console.log("DB connection Failed", error);
  }
}

export default testDBConnection;
