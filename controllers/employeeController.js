import Employee from "../models/Employee.js";

export const createEmployee = async (req, res) => {
  const employee = await Employee.create(req.body);
  res.status(201).json(employee);
};

export const getEmployees = async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
};

export const getEmployeeById = async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  // If role is user → only allow own data
  if (req.user.role === "user" && employee.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Access denied" });
  }

  res.json(employee);
};

export const updateEmployee = async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(employee);
};

export const searchEmployees = async (req, res) => {
  const { rsCode, department } = req.query;

  let filter = {};
  if (rsCode) filter.rsCode = rsCode;
  if (department) filter.department = department;

  const employees = await Employee.find(filter);
  res.json(employees);
};

// Delete an employee by ID
export const deleteEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  await employee.deleteOne();

  res.json({ message: "Employee deleted successfully" });
};

// Toggle active status of an employee
export const toggleActiveStatus = async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  employee.isActive = !employee.isActive;
  await employee.save();

  res.json(employee);
};
