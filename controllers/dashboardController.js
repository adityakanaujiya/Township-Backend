import Employee from "../models/Employee.js";
import Deduction from "../models/Deduction.js";
import Electricity from "../models/Electricity.js";

const sumField = async (model, match, field) => {
  const result = await model.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: `$${field}` } } },
  ]);
  return result[0]?.total || 0;
};

export const getAdminStats = async (req, res) => {
  try {
    const [totalEmployees, activeEmployees] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ isActive: true }),
    ]);

    const [totalDeductions, totalUnits] = await Promise.all([
      sumField(Deduction, {}, "totalDeduction"),
      sumField(Electricity, {}, "totalUnits"),
    ]);

    res.json({
      totalEmployees,
      activeEmployees,
      totalDeductions,
      totalUnits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSupervisorStats = async (req, res) => {
  try {
    const [totalEmployees, totalElectricity] = await Promise.all([
      Employee.countDocuments(),
      Electricity.countDocuments(),
    ]);

    res.json({ totalEmployees, totalElectricity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const [myDeductions, myElectricity] = await Promise.all([
      sumField(Deduction, { employeeId: employee._id }, "totalDeduction"),
      sumField(Electricity, { employeeId: employee._id }, "totalUnits"),
    ]);

    res.json({ myDeductions, myElectricity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};