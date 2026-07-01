import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  rate: { type: Number, default: 102 },
  withdrawMin: { type: Number, default: 50 },
  depositMin: { type: Number, default: 100 },
  trc20Address: { type: String, default: 'TU7f7jwJr56owuutyzbJEwVqF3ii4KCiPV' },
  erc20Address: { type: String, default: '0x78845f99b319b48393fbcde7d32fcb7ccd6661bf' },
  trc20QrUrl: { type: String, default: 'images/trc20.png' },
  erc20QrUrl: { type: String, default: 'images/erc20.png' },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
