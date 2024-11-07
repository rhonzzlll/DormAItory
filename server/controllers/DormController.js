const Dorm = require('../models/Dorm');

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

  return res.status(200).json({ message: "Could not find any existing dorms.", dorms: [] });
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

exports.updateDorm = async (req, res) => {
  try {
    const updatedDorm = await Dorm.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDorm) {
      return res.status(404).json({ message: 'Dorm not found' });
    }
    res.json(updatedDorm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteDorm = async (req, res) => {
  try {
    const deletedDorm = await Dorm.findByIdAndDelete(req.params.id);
    if (!deletedDorm) {
      return res.status(404).json({ message: 'Dorm not found' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};