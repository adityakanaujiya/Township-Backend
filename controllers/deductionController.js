import mongoose from "mongoose";
import Deduction from "../models/Deduction.js";
import Employee from "../models/Employee.js";
import Electricity from "../models/Electricity.js";
import { designationConfig } from "../utils/designationConfig.js";

export const generateDeduction = async (req, res) => {
  try {
    const { rsCode, month } = req.body;

    if (!rsCode || !month) {
      return res.status(400).json({
        message: "RS Code and month are required",
      });
    }

    const employee = await Employee.findOne({ rsCode });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found with given RS Code",
      });
    }

    const electricity = await Electricity.findOne({
      employeeId: employee._id,
      month,
    });

    if (!electricity) {
      return res.status(404).json({
        message: "Electricity record not found for this month",
      });
    }

    const existing = await Deduction.findOne({
      employeeId: employee._id,
      month,
    });

    if (existing) {
      return res.status(400).json({
        message: "Deduction already generated for this month",
      });
    }

    let config = designationConfig[employee.designation];

    if (!config) {
      const specialKey =
        employee.designation + "_" + employee.accommodationType;

      config = designationConfig[specialKey];
    }

    if (!config) {
      return res.status(400).json({
        message: `No configuration found for ${employee.designation}`,
      });
    }

    const rent = config.rent;
    const totalDeduction = rent + electricity.electricityAmount;

    const deduction = await Deduction.create({
      employeeId: employee._id,
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

export const getMyDeductions = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const deductions = await Deduction.find({
      employeeId: employee._id,
    });

    res.json(deductions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
