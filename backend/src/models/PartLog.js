const mongoose = require("mongoose");

const partLogSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    partName: { type: String, required: true },
    technicianName: { type: String, required: true },
    action: { type: String, enum: ["ISSUED", "RETURNED"], required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    syncedFromMobile: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PartLog", partLogSchema);
