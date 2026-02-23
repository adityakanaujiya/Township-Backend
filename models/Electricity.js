import mongoose from "mongoose";

const electricitySchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: { type: String, required: true },
    previousReading: Number,
    currentReading: Number,
    totalUnits: Number,
    electricityAmount: Number,
  },
  { timestamps: true },
);

export default mongoose.model("Electricity", electricitySchema);
