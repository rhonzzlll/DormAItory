const mongoose = require("mongoose");
const dorm = require('../models/Dorm');
const tenant = require('../models/tenant');
const user = require('../models/user');
const RoomChangeHistory = require('../models/RoomChangeHistory');

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

        const currentTenant = await tenant.findByIdAndUpdate(id._id, { $unset: { roomId: 1, rentAmount: 1, startDate: 1, endDate: 1, paymentStatus: 1 } });

        if (currentTenant) {
            const roomId = new mongoose.Types.ObjectId(id.roomId);
            const currentDorm = await dorm.findOne({ _id: roomId });
            await dorm.findOneAndUpdate({ _id: roomId }, { occupied: currentDorm.occupied - 1 });
            await user.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id.userId) }, { $unset: { roomNo: 1 } });

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
            userId,
            firstName, 
            lastName,
            rentAmount, 
            startDate, 
            endDate, 
            paymentStatus 
        } = req.body.formData;

        let foundUser;
        if (userId) {
            const currentUser = await user.findOne({ _id: userId, firstName, lastName });
            foundUser = currentUser || await user.findOne({ _id: userId });
        } else {
            foundUser = await user.findOne({ firstName, lastName });
        }

        if (!foundUser?._id) {
            return res.status(404).json({ message: "No tenant exists from the provided information." });
        }

        // Find the current tenant to compare dates/rent
        const currentTenant = await tenant.findById(id._id);

        let updateFields = { rentAmount, startDate, endDate, paymentStatus };

        // Regenerate payments if dates or rent changed
        if (
            currentTenant &&
            (currentTenant.startDate.toISOString().slice(0, 10) !== new Date(startDate).toISOString().slice(0, 10) ||
             currentTenant.endDate.toISOString().slice(0, 10) !== new Date(endDate).toISOString().slice(0, 10) ||
             currentTenant.rentAmount !== Number(rentAmount))
        ) {
            updateFields.payments = generatePayments(startDate, endDate, rentAmount);
        }

        if (id.userId === foundUser._id.toString()) {
            await tenant.findOneAndUpdate({ _id: id._id, userId: id.userId }, updateFields);
            return res.status(200).json({ message: "Tenant has been successfully updated." });
        } else {
            const newUserId = new mongoose.Types.ObjectId(foundUser._id);
            await tenant.findOneAndUpdate(
                { _id: id._id },
                { userId: newUserId, firstName: foundUser.firstName, lastName: foundUser.lastName, ...updateFields }
            );
            await user.findOneAndUpdate({ _id: newUserId }, { roomNo: foundUser.roomNo });
            await user.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id.userId) }, { $unset: { roomNo: 1 } });
            return res.status(200).json({ message: "Tenant has been successfully replaced." });
        }
    } catch (error) {
        console.log(error);
    }

    return res.status(500).json({ message: "Could not update the tenant, please try again." });
}

exports.createTenant = async (req, res) => {
    try {
        const { 
            userId,
            roomId, 
            firstName, 
            lastName,
            rentAmount, 
            startDate, 
            endDate, 
            paymentStatus 
        } = req.body.formData;

        let foundUserId;

        if (userId) {
            const currentUser = await user.findOne({ _id: userId, firstName, lastName });

            if (currentUser) {
                foundUserId = currentUser._id;
            } else {
                const foundUser = await user.findOne({ _id: userId });
                foundUserId = foundUser?._id;
            }
        } else {
            const foundUser = await user.findOne({ firstName, lastName });
            foundUserId = foundUser?._id;
        }
        
        if (!foundUserId) {
            return res.status(404).json({ message: "No tenant exists from the provided information." });
        }

        const foundTenant = await tenant.findOne({ userId: foundUserId });

        let newTenant;
        if (foundTenant) {
            newTenant = await tenant.findByIdAndUpdate(foundTenant._id, {
                roomId: new mongoose.Types.ObjectId(roomId),
                rentAmount: Number(rentAmount),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                paymentStatus
            });
        } else {
            const payments = generatePayments(startDate, endDate, rentAmount);
            newTenant = await tenant({ 
                roomId: new mongoose.Types.ObjectId(roomId),
                userId: new mongoose.Types.ObjectId(foundUserId),
                rentAmount: Number(rentAmount),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                paymentStatus,
                payments
            }).save();
        }
        
        if (newTenant) {
            const currentDorm = await dorm.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
            await dorm.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(roomId) }, { occupied: currentDorm.occupied + 1 });

            await user.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(foundUserId) }, { roomNo: currentDorm.roomNumber });

            return res.status(201).json({ message: "Tenant has been successfully created." });
        }
    } catch (error) {
        console.log(error);
    }

    return res.status(500).json({ message: "Could not create the tenant, please try again." });
}

exports.moveTenant = async (req, res) => {
    try {
        const { tenantId, newRoomId } = req.body;
        const foundTenant = await tenant.findById(tenantId);
        if (!foundTenant) return res.status(404).json({ message: "Tenant not found." });

        const oldDorm = await dorm.findById(foundTenant.roomId);
        const newDorm = await dorm.findById(newRoomId);
        if (!newDorm) return res.status(404).json({ message: "Target room not found." });
        if (newDorm.occupied >= newDorm.capacity) return res.status(400).json({ message: "Target room is full." });

        // Record room change history
        await RoomChangeHistory.create({
            tenantId: foundTenant._id,
            userId: foundTenant.userId,
            fromRoom: oldDorm ? oldDorm.roomNumber : '',
            toRoom: newDorm.roomNumber,
            moveInDate: new Date(),
            moveOutDate: foundTenant.endDate,
            changedBy: req.user?.name || 'system'
        });

        // Create a new tenant record for the new room
        const newTenant = await tenant.create({
            userId: foundTenant.userId,
            roomId: newRoomId,
            rentAmount: foundTenant.rentAmount,
            startDate: new Date(), // or keep the same, or set a new start date
            endDate: foundTenant.endDate,
            paymentStatus: foundTenant.paymentStatus
        });

        // Optionally: Delete the old tenant record
        await tenant.findByIdAndDelete(tenantId);

        // Update occupied counts
        if (oldDorm) {
            oldDorm.occupied = Math.max(0, oldDorm.occupied - 1);
            await oldDorm.save();
        }
        newDorm.occupied = (newDorm.occupied || 0) + 1;
        await newDorm.save();

        // Optionally update user's roomNo
        await user.findByIdAndUpdate(foundTenant.userId, { roomNo: newDorm.roomNumber });

        return res.status(200).json({ message: "Tenant moved successfully.", newTenant });
    } catch (error) {
        console.log("Move tenant error:", error);
        return res.status(500).json({ message: "Could not move tenant, please try again." });
    }
};

// Updated updatePaymentStatus function in tenantController.js
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { tenantId, month, status, datePaid, amount } = req.body;
    console.log('Request Data:', { tenantId, month, status, datePaid, amount });

    if (!tenantId || !month || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // First, check if the tenant exists
    const foundTenant = await tenant.findById(tenantId);
    if (!foundTenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Check if payment record exists for this month
    const existingPayment = foundTenant.payments.find(p => p.month === month);

    let updateResult;

    if (existingPayment) {
      // Update existing payment record, including amount and datePaid
      updateResult = await tenant.updateOne(
        { _id: tenantId, "payments.month": month },
        {
          $set: {
            "payments.$.status": status,
            "payments.$.datePaid": status === 'paid' ? (datePaid ? new Date(datePaid) : new Date()) : null,
            "payments.$.amount": amount !== undefined ? amount : existingPayment.amount
          }
        }
      );
    } else {
      // Create new payment record if it doesn't exist
      const newPayment = {
        month: month,
        status: status,
        datePaid: status === 'paid' ? (datePaid ? new Date(datePaid) : new Date()) : null,
        amount: amount !== undefined ? amount : foundTenant.rentAmount // Use provided amount or tenant's rent amount
      };

      updateResult = await tenant.updateOne(
        { _id: tenantId },
        {
          $push: { payments: newPayment }
        }
      );
    }

    console.log('Update Result:', updateResult);

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({ 
        message: `Failed to update payment record for month "${month}"` 
      });
    }

    const updatedTenant = await tenant.findById(tenantId);
    res.json({ 
      message: 'Payment status updated successfully', 
      tenant: updatedTenant 
    });

  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ 
      message: 'Server error: ' + err.message 
    });
  }
};

// Alternative function to add a new payment record
exports.addPayment = async (req, res) => {
  try {
    const { tenantId, month, amount, status = 'pending' } = req.body;

    if (!tenantId || !month) {
      return res.status(400).json({ message: 'Tenant ID and month are required' });
    }

    const foundTenant = await tenant.findById(tenantId);
    if (!foundTenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Check if payment for this month already exists
    const existingPayment = foundTenant.payments.find(p => p.month === month);
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment for this month already exists' });
    }

    const newPayment = {
      month: month,
      status: status,
      datePaid: status === 'paid' ? new Date() : null,
      amount: amount || foundTenant.rentAmount
    };

    const updateResult = await tenant.updateOne(
      { _id: tenantId },
      { $push: { payments: newPayment } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({ message: 'Failed to add payment record' });
    }

    const updatedTenant = await tenant.findById(tenantId);
    res.json({ 
      message: 'Payment record added successfully', 
      tenant: updatedTenant 
    });

  } catch (err) {
    console.error('Error adding payment:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

function generatePayments(startDate, endDate, rentAmount) {
  const payments = [];
  let current = new Date(startDate);
  const endDt = new Date(endDate);
  current.setDate(1);
  endDt.setDate(1);

  while (current <= endDt) {
    const month = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    payments.push({
      month,
      status: 'pending',
      datePaid: null,
      amount: rentAmount
    });
    current.setMonth(current.getMonth() + 1);
  }
  return payments;
}