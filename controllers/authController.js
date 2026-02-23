import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";
import { designationConfig } from "../utils/designationConfig.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role),
  });
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

// Admin-only route to update user role
export const updateUserRole = async (req, res) => {
  const { role } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.role = role;
  await user.save();

  res.json(user);
};

// Admin-only route to create user with employee details
export const createUserWithDetails = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,

      rsCode,
      department,
      designation,
      contactNo,
      building,
      floor,
      roomNo,
      section,
      accommodationType,
      checkInDate,
      checkOutDate,
      amenities,
      assets,
    } = req.body;

    // Check email duplicate
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check RS Code duplicate
    const existingEmployee = await Employee.findOne({ rsCode });
    if (existingEmployee) {
      return res.status(400).json({ message: "RS Code already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create login user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Get designation config
    let config = designationConfig[designation];

    if (!config) {
      const specialKey = designation + "_" + accommodationType;
      config = designationConfig[specialKey];
    }

    if (!config) {
      return res.status(400).json({
        message: "Invalid designation configuration",
      });
    }

    // Create employee
    const employee = await Employee.create({
      userId: user._id,
      rsCode,
      name,
      department,
      designation,
      contactNo,
      building,
      floor,
      roomNo,
      section,
      accommodationType,
      checkInDate,
      checkOutDate,
      amenities,
      assets,
    });

    res.status(201).json({
      message: "User created successfully",
      user,
      employee,
      facilityCharge: config.rent,
      electricityFreeUnits: config.freeUnits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
