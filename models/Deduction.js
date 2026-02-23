import mongoose from "mongoose";

const deductionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: { type: String, required: true },
    rent: Number,
    electricity: Number,
    totalDeduction: Number,
  },
  { timestamps: true },
);

export default mongoose.model("Deduction", deductionSchema);
