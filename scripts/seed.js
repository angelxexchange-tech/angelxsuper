import dbConnect from "../src/app/lib/db.js";
import Admin from "../src/app/lib/models/Admin.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  try {
    await dbConnect();
    const email = "admin@angelxsuper.com";
    const password = "Admin@123"; // as requested

    const hashed = await bcrypt.hash(password, 10);

    const existing = await Admin.findOne({ email });
    if (!existing) {
      await Admin.create({ email, password: hashed });
      console.log("Admin user created:", email);
    } else {
      await Admin.findByIdAndUpdate(existing._id, { password: hashed });
      console.log("Admin exists. Password updated for:", email);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();
