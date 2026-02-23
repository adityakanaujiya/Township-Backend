import Deduction from "../models/Deduction.js";
import Employee from "../models/Employee.js";
import Electricity from "../models/Electricity.js";
import { designationConfig } from "../utils/designationConfig.js";

export const generateDeduction = async (req, res) => {
  try {
    const { employeeId, month } = req.body;

    if (!employeeId || !month) {
      return res.status(400).json({ message: "employeeId and month required" });
    }

    const employee = await Employee.findById(employeeId);
    const electricity = await Electricity.findOne({ employeeId, month });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (!electricity) {
      return res.status(404).json({ message: "Electricity record not found" });
    }

    // 🔹 Safe config lookup
    let config = designationConfig[employee.designation];

    if (!config) {
      const specialKey =
        employee.designation + "_" + employee.accommodationType;

      config = designationConfig[specialKey];
    }

    if (!config) {
      return res.status(400).json({
        message: `No rent configuration found for ${employee.designation}`,
      });
    }

    const rent = config.rent;
    const totalDeduction = rent + electricity.electricityAmount;

    const deduction = await Deduction.create({
      employeeId,
      month,
      rent,
      electricity: electricity.electricityAmount,
      totalDeduction,
    });

    res.status(201).json(deduction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeductions = async (req, res) => {
  try {
    const data = await Deduction.find().populate("employeeId");
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
