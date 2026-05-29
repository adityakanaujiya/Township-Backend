import mongoose from "mongoose";
import Employee from "../models/Employee.js";

export const createEmployee = async (req, res) => {
  try {
    const { rsCode } = req.body;

    const existing = await Employee.findOne({ rsCode });
    if (existing) {
      return res.status(400).json({
        message: "Employee with this RS Code already exists",
      });
    }

    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (
      req.user.role === "user" &&
      employee.userId?.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyEmployee = async (req, res) => {
  try {
    console.log("Logged in user id:", req.user.id);

    const employee = await Employee.findOne({ userId: req.user.id });

    console.log("Found employee:", employee);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchEmployees = async (req, res) => {
  try {
    const { query, rsCode, department } = req.query;

    let filter = {};

    if (query) {
      const q = query.trim();
      if (q) {
        filter = {
          $or: [
            { rsCode: { $regex: q, $options: "i" } },
            { department: { $regex: q, $options: "i" } },
            { name: { $regex: q, $options: "i" } },
          ],
        };
      }
    } else {
      if (rsCode) {
        filter.rsCode = { $regex: rsCode, $options: "i" };
      }

      if (department) {
        filter.department = { $regex: department, $options: "i" };
      }
    }

    const employees = await Employee.find(filter);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await employee.deleteOne();
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid employee id" });
    }

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    employee.isActive = !employee.isActive;
    await employee.save();

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
