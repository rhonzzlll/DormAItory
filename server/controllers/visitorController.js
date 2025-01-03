const Form = require('../models/Form');
const User = require('../models/user');

exports.createVisitor = async (req, res) => {
  try {
    const {
      visitDate,
      arrivalTime,
      departureTime,
      purpose,
      items,
      specialInstructions,
      visitors,
      status,
      agreeToPolicy
    } = req.body;

    const form = new Form({
      visitDate,
      arrivalTime,
      departureTime,
      purpose: purpose || '',
      items: items || '',
      specialInstructions: specialInstructions || '',
      visitors,
      status: status || 'pending',
      agreeToPolicy
    });

    await form.save();
    return res.status(201).json({
      message: "Visitor registration successfully created.",
      data: { form }
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Failed to create visitor, please try again."
    });
  }
};

exports.getAllVisitors = async (req, res) => {
  try {
    const forms = await Form.aggregate([
      {
        $lookup: {
          from: "users",
          let: { visitorIds: "$visitors.userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$visitorIds"]
                }
              }
            }
          ],
          as: "visitorInfo"
        }
      },
      {
        $project: {
          "_id": 1,
          "visitDate": 1,
          "arrivalTime": 1,
          "departureTime": 1,
          "purpose": 1,
          "items": 1,
          "specialInstructions": 1,
          "status": 1,
          "visitors": 1,
          "visitorInfo._id": 1,
          "visitorInfo.fullName": 1,
          "visitorInfo.phoneNumber": 1,
          "visitorInfo.email": 1,
          "createdAt": 1,
          "updatedAt": 1
        }
      }
    ]);

    return res.status(200).json({ data: { visitors: forms } });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get visitors, please try again."
    });
  }
};

exports.getVisitorById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id).populate('visitors.userId');

    if (!form) {
      return res.status(404).json({
        message: 'Visitor registration not found'
      });
    }

    return res.status(200).json({ data: { form } });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get visitor, please try again."
    });
  }
};

exports.updateVisitorById = async (req, res) => {
  try {
    const {
      visitDate,
      arrivalTime,
      departureTime,
      purpose,
      items,
      specialInstructions,
      visitors,
      status
    } = req.body;

    const form = await Form.findByIdAndUpdate(
      req.params.id,
      {
        visitDate,
        arrivalTime,
        departureTime,
        purpose,
        items,
        specialInstructions,
        visitors,
        status
      },
      { new: true, runValidators: true }
    );

    if (!form) {
      return res.status(404).json({
        message: 'Visitor registration not found'
      });
    }

    return res.status(200).json({
      message: "Visitor registration successfully updated.",
      data: { form }
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Failed to update visitor, please try again."
    });
  }
};

exports.updateVisitorStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    const form = await Form.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!form) {
      return res.status(404).json({
        message: 'Visitor registration not found'
      });
    }

    return res.status(200).json({
      message: `Successfully updated the status of visitor registration with ID ${id}`,
      data: { form }
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Failed to update visitor status, please try again."
    });
  }
};

exports.deleteVisitorById = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await Form.findByIdAndDelete(id);

    if (!form) {
      return res.status(404).json({
        message: 'Visitor registration not found'
      });
    }

    return res.status(200).json({
      message: 'Visitor registration successfully deleted',
      data: { form }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to delete visitor, please try again."
    });
  }
};