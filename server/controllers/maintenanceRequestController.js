const maintenanceRequest = require('../models/maintenanceRequest');
const tenant = require('../models/tenant');
const user = require('../models/user');

exports.updateRequestStatus = async (req, res) => {
    try {
        const { 
            _id,
            status
        } = req.body;

        const foundRequest = await maintenanceRequest.findOneAndUpdate({ _id }, { status });

        if (foundRequest) {
            return res.status(200).json({ message: `Successfully updated the status of maintenance request with ID ${_id}`});
        }
    } catch (error) {
        console.log(error);
    }

    return res.status(500).json({ message: "Getting all maintenance requests failed, please try again." });
}

exports.deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const foundRequest = await maintenanceRequest.findByIdAndDelete(id);

        if (foundRequest) {
            return res.status(200).json({ message: "Successfully deleted request." });
        }
    } catch (error) {
        console.log(error);
    }

    return res.status(500).json({ message: "Failed to delete request, please try again." });
}

exports.getAllRequests = async (req, res) => {
    try {
        const foundRequests = await maintenanceRequest.aggregate([
            {
                $lookup: {
                    from: "tenants",
                    let: { tenantId: "$tenantId" },
                    pipeline: [ 
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$tenantId"]}
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "dorms",
                                localField: "roomId",
                                foreignField: "roomId",
                                as: "dorm"
                            }
                        },
                        {
                            $unwind: {
                                path: "$dorm",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "userId",
                                foreignField: "_id",
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
                    as: "tenant"
                }
            },
            {
                $project: { 
                    "_id": 1, 
                    "tenantId": 1, 
                    "concernType": 1,
                    "specificationOfConcern": 1,
                    "status": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "tenant.info._id": 1,
                    "tenant.info.firstName": 1, 
                    "tenant.info.lastName": 1,
                    "tenant.info.roomNo": 1 
                }
            }
        ]);

        return res.status(200).json({ data: { requests: foundRequests }});
    } catch (error) {
        console.log(error);
    }

    return res.status(500).json({ message: "Getting all maintenance requests failed, please try again." });
}

exports.updateRequest = async (req, res) => {
    try {
        const {
            _id,
            userId,
            tenantId,
            concernType,
            specificationOfConcern,
            status,
            dateSubmitted
        } = req.body;

        let foundUser;
        if (userId) {
            const currentUser = await user.findOne({ _id: userId, firstName, lastName });

            if (currentUser) {
                foundUser = currentUser;
            } else {
                foundUser = await user.findOne({ _id: userId });
            }
        } else {
            foundUser = await user.findOne({ firstName, lastName });
        }

        if (!foundUser) {
            return res.status(404).json({ message: "Specified user could not be found."});
        }

        const foundTenant = await tenant.findOne({ userId: foundUser._id });

        let foundRequest;
        if (foundTenant._id === tenantId) {
            foundRequest = await maintenanceRequest.findOneAndUpdate({ _id, tenantId }, {
                concernType,
                specificationOfConcern,
                status,
                createdAt: dateSubmitted
            });
        } else {
            foundRequest = await maintenanceRequest.findOneAndUpdate({ _id }, {
                tenantId,
                concernType,
                specificationOfConcern,
                status,
                createdAt: dateSubmitted
            });
        }

        if (foundRequest) {
            return res.status(200).json({ message: "Successfully updated the request." });
        }
    } catch (error) {
        console.log(error);
    }

    return res.status(500).json({ message: "Failed to update the request, please try again." });
}

exports.createRequest = async (req, res) => {
    try {
        const {
            userId,
            firstName,
            lastName,
            concernType,
            specificationOfConcern,
            status,
            createdAt
        } = req.body;

        let foundUser;
        if (userId) {
            const currentUser = await user.findOne({ _id: userId, firstName, lastName });

            if (currentUser) {
                foundUser = currentUser;
            } else {
                foundUser = await user.findOne({ _id: userId });
            }
        } else {
            foundUser = await user.findOne({ firstName, lastName });
        }

        if (!foundUser) {
            return res.status(404).json({ message: "Specified user could not be found."});
        }
        
        const foundTenant = await tenant.findOne({ userId: foundUser._id });

        const foundRequest = await maintenanceRequest({
            tenantId: foundTenant._id,
            concernType,
            specificationOfConcern,
            status,
            createdAt: createdAt ?? new Date().toISOString().split("T")[0]
        }).save();

        if (foundRequest) {
            return res.status(201).json({ message: "Maintenance request successfuly created. "});
        }
    } catch (error) {
        console.log(error);
    }

    return res.status(500).json({ message: "Maintenance request was sent unsuccessful, please try again." });
}

exports.sendRequest = async (req, res) => {
    try {
        const {
            tenantId,
            concernType,
            specificationOfConcern,
            status,
            createdAt
         } = req.body;

        const foundRequest = await maintenanceRequest({
            tenantId,
            concernType,
            specificationOfConcern,
            status: status ?? status,
            createdAt: createdAt ?? new Date().toISOString().split("T")[0]
        }).save();

        if (foundRequest) {
            return res.status(201).json({ message: "Maintenance request successfuly created. "});
        }
    } catch (error) {
        console.log(error);
    }

    return res.status(500).json({ message: "Maintenance request was sent unsuccessful, please try again." });
}