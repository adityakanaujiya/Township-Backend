import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    rsCode: { type: String, unique: true, required: true },

    name: { type: String, required: true },

    department: { type: String, required: true },

    designation: { type: String, required: true },

    contactNo: { type: String, required: true },

    building: { type: String },

    floor: { type: String },

    roomNo: { type: String },

    section: { type: String },

    accommodationType: {
      type: String,
      enum: ["Family", "Bachelor"],
      required: true,
    },

    checkInDate: { type: Date },

    checkOutDate: { type: Date },

    amenities: [{ type: String }],

    assets: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Employee", employeeSchema);
