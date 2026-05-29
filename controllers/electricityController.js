import Electricity from "../models/Electricity.js";
import Employee from "../models/Employee.js";
import { designationConfig } from "../utils/designationConfig.js";

const UNIT_RATE = 4.5;
const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const getEmployeeConfig = (employee) => {
  let config = designationConfig[employee.designation];

  if (!config) {
    const specialKey = `${employee.designation}_${employee.accommodationType}`;
    config = designationConfig[specialKey];
  }

  return config;
};

const enrichRecord = (record) => {
  const employee = record.employeeId;
  const config = employee ? getEmployeeConfig(employee) : null;
  const freeUnits = config?.freeUnits ?? 0;
  const chargeableUnits = Math.max((record.totalUnits || 0) - freeUnits, 0);

  return {
    ...record.toObject(),
    rsCode: employee?.rsCode || "",
    employeeName: employee?.name || "",
    designation: employee?.designation || "",
    accommodationType: employee?.accommodationType || "",
    freeUnits,
    chargeableUnits,
    ratePerUnit: UNIT_RATE,
  };
};

export const addElectricity = async (req, res) => {
  try {
    const rsCode =
      req.body.rsCode ||
      req.body.rsid ||
      req.body.rsId ||
      req.body.employeeId ||
      req.body.name ||
      req.body.employeeName ||
      "";
    const month = (req.body.month || getCurrentMonth()).trim();
    const unitsUsed =
      req.body.unitsUsed ?? req.body.units ?? req.body.uits ?? req.body.unitUsed;

    if (!String(rsCode).trim() || unitsUsed == null || unitsUsed === "") {
      return res
        .status(400)
        .json({ message: "RS Code or name and units used are required" });
    }

    const lookupValue = String(rsCode).trim();
    const normalizedRsCode = lookupValue.toUpperCase();
    const normalizedUnits = Number(unitsUsed);

    if (Number.isNaN(normalizedUnits) || normalizedUnits < 0) {
      return res
        .status(400)
        .json({ message: "Units used must be a valid positive number" });
    }

    const employee =
      (await Employee.findOne({ rsCode: normalizedRsCode })) ||
      (await Employee.findOne({
        name: { $regex: `^${lookupValue}$`, $options: "i" },
      }));

    if (!employee) {
      return res
        .status(404)
        .json({ message: "Employee not found for this RS Code or name" });
    }

    const existingRecord = await Electricity.findOne({
      employeeId: employee._id,
      month,
    });

    if (existingRecord) {
      return res.status(400).json({
        message: "Electricity already calculated for this RS Code and month",
      });
    }

    const config = getEmployeeConfig(employee);

    if (!config) {
      return res.status(400).json({
        message: "No electricity configuration found for this employee designation",
      });
    }

    const chargeableUnits = Math.max(normalizedUnits - config.freeUnits, 0);
    const electricityAmount = chargeableUnits * UNIT_RATE;

    const record = await Electricity.create({
      employeeId: employee._id,
      month,
      previousReading: 0,
      currentReading: normalizedUnits,
      totalUnits: normalizedUnits,
      electricityAmount,
    });

    const populatedRecord = await Electricity.findById(record._id).populate("employeeId");

    res.status(201).json(enrichRecord(populatedRecord));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getElectricity = async (req, res) => {
  try {
    const data = await Electricity.find()
      .populate("employeeId")
      .sort({ createdAt: -1 });

    res.json(data.map(enrichRecord));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyElectricity = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const data = await Electricity.find({
      employeeId: employee._id,
    })
      .populate("employeeId")
      .sort({ createdAt: -1 });

    res.json(data.map(enrichRecord));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
