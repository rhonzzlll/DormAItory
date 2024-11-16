const mongoose = require("mongoose");
const dorm = require('../models/Dorm');
const tenant = require('../models/tenant');
const user = require('../models/user');

exports.getTenant = async (req, res) => {
    try {
        const { id } = req.params;

        const foundTenant = await tenant.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: "dorms",
                    let: { roomId: "$roomId" },
                    pipeline: [ 
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$roomId"]}
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "userId",
                                foreignField: "userId",
                                as: "info"
                            }
                        },
                        {
                            $unwind: {
                                path: "$user",
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ],
                    as: "user"
                }
            },
            {
                $project: { 
                    "_id": 1, 
                    "roomId": 1,
                    "userId": 1,
                    "user.roomNumber": 1, 
                    "user.info.firstName": 1, 
                    "user.info.lastName": 1 
                }
            }
        ]);

        return res.status(200).json({ data: { tenant: foundTenant } });
    } catch (error) {
        console.log(error);
    }

    return res.status(500).json({ message: "Could not get the specified tenant, please try again." });
}

exports.deleteTenant = async (req, res) => {
    try {
        const {
            id,
        } = req.body.tenant; 

        const currentTenant = await tenant.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id._id) });

        if (currentTenant) {
            const roomId = new mongoose.Types.ObjectId(id.roomId);
            const currentDorm = await dorm.findOne({ _id: roomId });
            await dorm.findOneAndUpdate({ _id: roomId }, { occupied: currentDorm.occupied - 1 });

            const test = await user.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id.userId) }, { $unset: { roomNo: 1 } });

            return res.status(200).json({ message: "Tenant has been successfully deleted." });
        }
    } catch (error) {
        console.log(error);
    }

    return res.status(500).json({ message: "Could not delete the specified tenant, please try again." });
}

exports.updateTenant = async (req, res) => {
    try {
        const {
            id,
            firstName, 
            lastName,
            rentAmount, 
            startDate, 
            endDate, 
            paymentStatus 
        } = req.body.formData;

        const foundUser = await user.findOne({ firstName, lastName });

        if (id.userId === foundUser._id.toString()) {
            await tenant.findOneAndUpdate({ _id: id._id, userId: id.userId }, { rentAmount, startDate, endDate, paymentStatus });

            return res.status(200).json({ message: "Tenant has been successfully updated." });
        } else {
            const newUserId = new mongoose.Types.ObjectId(foundUser._id);
            await tenant.findOneAndUpdate({ _id: id._id }, { userId: newUserId, firstName: foundUser.firstName, lastName: foundUser.lastName, rentAmount, startDate, endDate, paymentStatus });

            await user.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(newUserId) }, { roomNo: foundUser.roomNo });
            await user.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id.userId) }, { $unset: { roomNo: 1 } });

            return res.status(200).json({ message: "Tenant has been successfully replaced." });
        }
    } catch (error) {
        console.log(error);
    }

    return res.status(500).json({ message: "Could not create the tenant, please try again." });
}

exports.createTenant = async (req, res) => {
    try {
        const { 
            roomId, 
            firstName, 
            lastName,
            rentAmount, 
            startDate, 
            endDate, 
            paymentStatus 
        } = req.body.formData;

        const { _id: userId } = await user.findOne({ firstName, lastName });

        if (!userId) {
            return res.status(404).json({ message: "No tenant exists from the provided information." });
        }

        const newTenant = await tenant({ 
            roomId: new mongoose.Types.ObjectId(roomId),
            userId: new mongoose.Types.ObjectId(userId),
            rentAmount: Number(rentAmount),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            paymentStatus
        }).save();

        if (newTenant) {
            const currentDorm = await dorm.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
            await dorm.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(roomId) }, { occupied: currentDorm.occupied + 1 });

            await user.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(userId) }, { roomNo: currentDorm.roomNumber });

            return res.status(201).json({ message: "Tenant has been successfully created." });
        }
    } catch (error) {
        console.log(error);
    }

    return res.status(500).json({ message: "Could not create the tenant, please try again." });
}