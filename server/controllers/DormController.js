const Dorm = require('../models/Dorm');
const Tenant = require("../models/tenant");

exports.updateDorm = async (req, res) => {
  try {
    const {
      _id,
      roomNumber,
      capacity,
      occupied,
      gender, // <-- Add this
      electricity,
      water,
      price,
      aircon,
      wifi,
      bathroom,
      description
    } = req.body;

    const existingRoom = await Dorm.findOne({ roomNumber });

    if (!existingRoom || existingRoom._id.toString() === _id) {
      await Dorm.findOneAndUpdate(
        { _id },
        {
          roomNumber,
          capacity,
          occupied,
          gender, // <-- Add this
          electricity,
          water,
          price,
          amenities: { aircon, wifi, bathroom },
          description
        }
      );
      return res.status(200).json({ message: "Dorm was edited successfully." });
    } else {
      return res.status(409).json({ message: "Dorm with the specified number already exists." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Editing the dorm was unsuccessful, please try again." });
  }
};

exports.getAllDorms = async (req, res) => {
  try {
    const dorms = await Dorm.aggregate([
      {
        "$lookup": {
          from: "tenants",
          localField: "_id",
          foreignField: "roomId",
          as: "tenants"
        }
      },
      {
        "$unwind": {
          path: "$tenants",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        "$lookup": {
          from: "users",
          localField: "tenants.userId",
          foreignField: "_id",
          as: "tenants.userInfo"
        }
      },
      {
        "$unwind": {
          path: "$tenants.userInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        "$group": {
          "_id": "$_id",
          "dorm": { "$first": "$$ROOT" },
          "tenantInfo": {
            "$push": {
              "id": {
                "_id": "$tenants._id",
                "userId": "$tenants.userId",
                "roomId": "$tenants.roomId"
              },
              "firstName": "$tenants.userInfo.firstName",
              "lastName": "$tenants.userInfo.lastName",
              "email": "$tenants.userInfo.email",
              "contactNumber": "$tenants.userInfo.phoneNumber",
              "rentAmount": "$tenants.rentAmount",
              "startDate": "$tenants.startDate",
              "endDate": "$tenants.endDate",
              "paymentStatus": "$tenants.paymentStatus"
            }
          }
        }
      },
      {
        "$project": {
          dorm: 1,
          tenants: {
            $filter: {
              input: "$tenantInfo",
              as: "tenant",
              cond: { $ne: ["$$tenant.id", {}] }
            }
          }
        }
      },
      {
        "$replaceRoot": { "newRoot": { "$mergeObjects": ["$dorm", { "tenants": "$tenants" }] } }
      }
    ]);

    if (dorms.length > 0) {
      return res.status(200).json({ dorms });
    } else {
      return res.status(404).json({ message: "No dorms found." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Could not find any existing dorms.", dorms: [] });
  }
};

exports.getDorm = async (req, res) => {
  try {
    const dorm = await Dorm.findById(req.params.id).populate('tenants');
    if (!dorm) {
      return res.status(404).json({ message: 'Dorm not found' });
    }
    return res.json(dorm);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.createDorm = async (req, res) => {
  try {
    const {
      roomNumber,
      capacity,
      occupied,
      gender, // <-- Add this
      electricity,
      water,
      price,
      amenities,
      description,
      images,
      tenants
    } = req.body;

    const dorm = new Dorm({
      roomNumber,
      capacity,
      occupied,
      gender, // <-- Add this
      electricity,
      water,
      price,
      amenities,
      description,
      images,
      tenants
    });

    const newDorm = await dorm.save();
    return res.status(201).json(newDorm);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteDorm = async (req, res) => {
  try {
    const { id } = req.params;

    const foundDorm = await Dorm.findOne({ _id: id });

    if (foundDorm) {
      await Tenant.updateMany({ roomId: foundDorm._id }, { $unset: { roomId: 1, rentAmount: 1, startDate: 1, endDate: 1, paymentStatus: 1 } });
      await Dorm.findByIdAndDelete(id);

      return res.status(200).json({ message: "Successfully deleted dorm." });
    } else {
      return res.status(404).json({ message: "Dorm not found." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Could not delete dorm, please try again." });
  }
};

exports.createTenant = async (req, res) => {
  const tenant = new Tenant(req.body);
  try {
    const newTenant = await tenant.save();
    const updatedDorm = await Dorm.findByIdAndUpdate(
      tenant.roomId,
      { $inc: { occupied: 1 } },
      { new: true }
    ).populate('tenants');
    return res.status(201).json({ tenant: newTenant, dorm: updatedDorm });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

exports.updateTenant = async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    const updatedTenant = await Tenant.findByIdAndUpdate(_id, updateData, { new: true });
    const updatedDorm = await Dorm.findById(updatedTenant.roomId).populate('tenants');
    return res.status(200).json({ tenant: updatedTenant, dorm: updatedDorm });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteTenant = async (req, res) => {
  try {
    const { _id } = req.body;
    const tenant = await Tenant.findByIdAndDelete(_id);
    if (tenant) {
      const updatedDorm = await Dorm.findByIdAndUpdate(
        tenant.roomId,
        { $inc: { occupied: -1 } },
        { new: true }
      ).populate('tenants');
      return res.status(200).json({ message: "Tenant deleted successfully.", dorm: updatedDorm });
    } else {
      return res.status(404).json({ message: "Tenant not found." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Could not delete tenant, please try again." });
  }
};