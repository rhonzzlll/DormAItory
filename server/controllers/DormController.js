const Dorm = require('../models/Dorm');
const tenant = require("../models/tenant");

exports.updateDorm = async (req, res) => {
  try {
    const {
      _id,
      roomNumber,
      capacity,
      occupied,
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
      await Dorm.findOneAndUpdate({ _id, roomNumber }, { roomNumber, capacity, occupied, electricity: electricity, water: water, price, amenities: { aircon, wifi, bathroom }, description});
      return res.status(200).json({ message: "Dorm was edited successfully." });
    } else {
      return res.status(409).json({ message: "Dorm with the specified number already exists."});
    }
  } catch (error) {
    console.log(error);
  }

  return res.status(500).json({ message: "Editing the dorm was unsuccessful, please try again." });
}

exports.getAllDorms = async (req, res) => {
  try {
    const dorms = await Dorm.aggregate([
      {
        "$lookup": {
          from: "tenants",
          localField: "_id",
          foreignField: "roomId",
          as: "tenants"
        }, 
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
            "$first": {
              "id": {
                "_id": "$tenants._id",
                "userId": "$tenants.userId",
                "roomId": "$tenants.roomId"
              }, 
              "firstName": "$tenants.userInfo.firstName",
              "lastName":  "$tenants.userInfo.lastName",
              "email":  "$tenants.userInfo.email",
              "contactNumber":  "$tenants.userInfo.phoneNumber",
              "rentAmount":  "$tenants.rentAmount",
              "startDate":  "$tenants.startDate",
              "endDate":  "$tenants.endDate",
              "paymentStatus":  "$tenants.paymentStatus"
            }
          }
        }
      },
      {
        "$group": {
          "_id": "$_id",
          "dorm": { "$first": "$dorm" },
          "tenants": {
            "$push": {
              "id": {
                "_id": "$tenantInfo.id._id",
                "userId": "$tenantInfo.id.userId",
                "roomId": "$tenantInfo.id.roomId"
              }, 
              "firstName": "$tenantInfo.firstName",
              "lastName":  "$tenantInfo.lastName",
              "email":  "$tenantInfo.email",
              "contactNumber":  "$tenantInfo.contactNumber",
              "rentAmount":  "$tenantInfo.rentAmount",
              "startDate":  "$tenantInfo.startDate",
              "endDate":  "$tenantInfo.endDate",
              "paymentStatus":  "$tenantInfo.paymentStatus"
            }
          }
        }
      },
      {
        "$project": {
          dorm: 1,
          tenants: {
            $filter: {
              input: "$tenants",
              as: "tenant",
              cond: { 
                $ne: ["$$tenant.id", {}]
              }
            }
          }
        }
      },
      {
       "$replaceRoot": { "newRoot": { "$mergeObjects": ["$dorm", { "tenants": "$tenants" }] } }
      }
    ]);

    if (dorms) {
      return res.status(200).json({ dorms });
    }
  } catch (error) {
    console.log(error);
  }

  return res.status(500).json({ message: "Could not find any existing dorms.", dorms: [] });
};

exports.getDorm = async (req, res) => {
  try {
    const dorm = await Dorm.findById(req.params.id);
    if (!dorm) {
      return res.status(404).json({ message: 'Dorm not found' });
    }
    res.json(dorm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDorm = async (req, res) => {
  const dorm = new Dorm(req.body);
  try {
    const newDorm = await dorm.save();
    res.status(201).json(newDorm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteDorm = async (req, res) => {
  try {
    const { id } = req.params;

    const foundDorm = await Dorm.findOne({ _id: id });

    if (foundDorm) {
      await tenant.updateMany({ roomId: foundDorm._id }, { $unset: { roomId: 1, rentAmount: 1, startDate: 1, endDate: 1, paymentStatus: 1 }});
      await Dorm.findByIdAndDelete(id);
      
      return res.status(200).json({ message: "Successfully deleted dorm." });
    }
  } catch (error) {
    console.log(error);
  }

  return res.status(500).json({ message: "Could not delete dorm, please try again." });
};