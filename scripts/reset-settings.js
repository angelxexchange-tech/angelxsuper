import dbConnect from "../src/app/lib/db.js";
import Settings from "../src/app/lib/models/Settings.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function resetSettings() {
  try {
    await dbConnect();
    
    // Delete all existing settings
    await Settings.deleteMany({});
    console.log('✅ Deleted old settings');

    // Create fresh settings with correct values
    const settings = await Settings.create({
        rate: 102,
        withdrawMin: 50,
        depositMin: 100,
        trc20Address: "TU7f7jwJr56owuutyzbJEwVqF3ii4KCiPV",
        erc20Address: "0x78845f99b319b48393fbcde7d32fcb7ccd6661bf",
        trc20QrUrl: "images/trc20.png",
        erc20QrUrl: "images/erc20.png",
    });

    console.log('✅ Created fresh settings:', settings);
  } catch (err) {
    console.error('❌ Error resetting settings:', err.message);
  } finally {
    process.exit(0);
  }
}

resetSettings();
