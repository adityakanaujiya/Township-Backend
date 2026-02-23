import Electricity from "../models/Electricity.js";
import Employee from "../models/Employee.js";
import { designationConfig } from "../utils/designationConfig.js";

export const addElectricity = async (req, res) => {
  try {
    const { employeeId, month, previousReading, currentReading } = req.body;

    // 🔹 Basic validation
    if (
      !employeeId ||
      !month ||
      previousReading == null ||
      currentReading == null
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 🔹 Determine correct config key
    let config;

    // First try direct designation match
    config = designationConfig[employee.designation];

    // If not found, try special key with accommodation
    if (!config) {
      const specialKey =
        employee.designation + "_" + employee.accommodationType;

      config = designationConfig[specialKey];
    }

    // If still not found → stop
    if (!config) {
      return res.status(400).json({
        message: `No configuration found for designation: ${employee.designation}`,
      });
    }

    // 🔹 Calculate units safely
    const totalUnits = currentReading - previousReading;

    if (totalUnits < 0) {
      return res.status(400).json({
        message: "Current reading cannot be less than previous reading",
      });
    }

    let electricityAmount = 0;

    if (totalUnits > config.freeUnits) {
      const extraUnits = totalUnits - config.freeUnits;
      electricityAmount = extraUnits * 4.5;
    }

    const record = await Electricity.create({
      employeeId,
      month,
      previousReading,
      currentReading,
      totalUnits,
      electricityAmount,
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getElectricity = async (req, res) => {
  try {
    const data = await Electricity.find().populate("employeeId");
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
