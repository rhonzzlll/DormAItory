const mongoose = require('mongoose');
const Chatroom = require("../models/chatroom");
const ChatroomMembers = require("../models/chatroomMembers");
const Prompt = require("../models/prompt");
const Message = require("../models/message");
const User = require("../models/user");
const Dorm = require("../models/Dorm");
const Tenant = require("../models/tenant");

/**
 * Uses Levenshtein algorithm
 * to calculate the similarity
 * of user input & prompts
 */
const calculateSimilarity = async (content, query) => {
    let editCost,
        stringA = content.toLowerCase(),
        stringB = query.toLowerCase(),
        lengthA = stringA.length,
        lengthB = stringB.length;

    if (lengthA <= lengthB) {
        [lengthA, lengthB] = [lengthB, lengthA];
        [stringA, stringB] = [stringB, stringA];
    }

    let distanceMatrix = [];
    distanceMatrix[0] = [];

    for (let idx = 0; idx <= lengthB; idx++) {
        distanceMatrix[0][idx] = idx;
    }

    for (let x = 1; x <= lengthA; x++) {
        distanceMatrix[x] = [];
        distanceMatrix[x][0] = x;

        for (let y = 1; y <= lengthB; y++) {
            editCost = stringA.charAt(x - 1) === stringB.charAt(y - 1) ? 0 : 1;
            distanceMatrix[x][y] = Math.min(
                distanceMatrix[x - 1][y] + 1,
                distanceMatrix[x][y - 1] + 1,
                distanceMatrix[x - 1][y - 1] + editCost,
            );
        }
    }

    const maxLength = lengthA > lengthB ? lengthA : lengthB;

    return [query, (1 - distanceMatrix[lengthA][lengthB] / maxLength) * 100];
};

/**
 * Formats a date string or Date object to a more readable format
 * @param {string|Date} date - The date to format
 * @returns {string} The formatted date string
 */
const formatDate = (date) => {
    if (!date) return "Not specified";

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return date; // Return original if invalid

    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const sendBotQuery = async (message, res) => {
    try {
        const req = await fetch("http://dormaitory.online:5005/model/parse", {
            method: "POST",
            headers: {
                "Accept": "application/json"
            },
            body: JSON.stringify({
                text: message.content
            })
        });

        const { entities } = await req.json();
        
        // Debug log to see what entities are being extracted
        console.log("Extracted entities:", JSON.stringify(entities));

        const botMessage = new Message({
            roomId: message.roomId,
            sender: message.receiver,
            receiver: message.sender,
            content: "Sorry, I could not understand what you meant, may you please try again? Thank you!"
        });

        if (entities.length === 0) {
            botMessage.content = "Sorry, could you please be more specific with your query. Thank you!";
            return res.status(200).json({ data: { response: botMessage.content } });
        }

        // Create a map of entities for easier access
        const entityMap = {};
        entities.forEach(item => {
            entityMap[item.entity] = item.value;
        });
        
        // Handle first name and last name queries with case-insensitive search
        if (entityMap.firstName && entityMap.lastName) {
            // Case-insensitive search for first and last name
            const users = await User.find({
                firstName: { $regex: new RegExp(`^${entityMap.firstName}$`, 'i') },
                lastName: { $regex: new RegExp(`^${entityMap.lastName}$`, 'i') }
            });

            // Process users and format response
            return await processUserResults(users, botMessage, res, `${entityMap.firstName} ${entityMap.lastName}`);
        } 
        else if (entityMap.firstName) {
            // Case-insensitive search for first name only
            const users = await User.find({
                firstName: { $regex: new RegExp(`^${entityMap.firstName}$`, 'i') }
            });

            // Process users and format response
            return await processUserResults(users, botMessage, res, entityMap.firstName, 'firstName');
        } 
        else if (entityMap.lastName) {
            // Case-insensitive search for last name only
            const users = await User.find({
                lastName: { $regex: new RegExp(`^${entityMap.lastName}$`, 'i') }
            });

            // Process users and format response
            return await processUserResults(users, botMessage, res, entityMap.lastName, 'lastName');
        }
        else if (entityMap._id) {
            // Find user by ID and then get room info
            const foundUser = await User.findOne({ "_id": new mongoose.Types.ObjectId(entityMap._id) });

            if (foundUser) {
                // Find tenant info to get room details
                const tenantInfo = await Tenant.findOne({ userId: foundUser._id });
                let roomInfo = "Not assigned";

                if (tenantInfo && tenantInfo.roomId) {
                    const room = await Dorm.findOne({ _id: tenantInfo.roomId });
                    if (room) {
                        roomInfo = room.roomNumber;
                    }
                }

                const { firstName, lastName, email, phoneNumber } = foundUser;
                const startDate = tenantInfo ? formatDate(tenantInfo.startDate) : "Not specified";
                const endDate = tenantInfo ? formatDate(tenantInfo.endDate) : "Not specified";
                const paymentStatus = tenantInfo ? tenantInfo.paymentStatus : "Not specified";

                botMessage.content = `That user appears to be ${firstName} ${lastName}. They live in room number ${roomInfo}. You may contact them via their email (${email}) or phone number (+63${phoneNumber}). The contract starts on ${startDate} and ends on ${endDate}. The payment status is ${paymentStatus}.`;
            } else {
                botMessage.content = `Sorry, I couldn't find anyone with the ID ${entityMap._id}`;
            }
        }
        else if (entityMap.roomNumber) {
            // Keep the existing room number handling code as it's working
            const foundDorm = await Dorm.aggregate([
                {
                    $match: { roomNumber: entityMap.roomNumber }
                },
                {
                    $lookup: {
                        from: "tenants",
                        let: { roomId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$roomId", "$$roomId"] }
                                        ]
                                    }
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
                                    path: "$info",
                                    preserveNullAndEmptyArrays: true
                                }
                            }
                        ],
                        as: "tenants"
                    }
                },
            ]);

            if (foundDorm.length === 1) {
                let message = `Room ${entityMap.roomNumber} contains ${foundDorm[0]["occupied"]} people, up to ${foundDorm[0]["capacity"]}, with a renting price starting at ${foundDorm[0]["price"]} pesos. It has`;

                if (foundDorm[0]["amenities"]["aircon"]) {
                    message += " aircon";
                } else {
                    message += " no aircon";
                }

                if (foundDorm[0]["amenities"]["wifi"]) {
                    message += ", WIFI";
                } else {
                    message += ", no WIFI";
                }

                if (foundDorm[0]["amenities"]["bathroom"]) {
                    message += ", bathroom";
                } else {
                    message += ", no bathroom";
                }

                if (foundDorm[0]["occupied"] === 0) {
                    message += ", and there are no people that currently live in this room.";
                } else {
                    message += ", and people that currently live here are:\n\n";

                    for (const tenant of foundDorm[0]["tenants"]) {
                        message += `(${tenant["userId"]}) ${tenant["info"]["firstName"]} ${tenant["info"]["lastName"]} from room ${entityMap.roomNumber}\n`;
                        message += `  - Rent Amount: ${tenant["rentAmount"]} pesos\n`;
                        message += `  - Contract: ${formatDate(tenant["startDate"])} to ${formatDate(tenant["endDate"])}\n`;
                        message += `  - Payment Status: ${tenant["paymentStatus"]}\n\n`;
                    }
                }
                botMessage.content = message;
            } else {
                botMessage.content = `Sorry but I could not find anything about room ${entityMap.roomNumber}.`;
            }
        }
        // Handle other entity types (startdate, enddate, status)
        else if (entityMap.startdate) {
            const foundDorm = await Dorm.findOne({ "startDate": entityMap.startdate });

            if (foundDorm) {
                botMessage.content = `The start date for the dorm is ${formatDate(foundDorm.startDate)}.`;
            } else {
                botMessage.content = `Sorry, I couldn't find any dorm with the start date ${entityMap.startdate}.`;
            }
        } 
        else if (entityMap.enddate) {
            const foundDorm = await Dorm.findOne({ "endDate": entityMap.enddate });

            if (foundDorm) {
                botMessage.content = `The end date for the dorm is ${formatDate(foundDorm.endDate)}.`;
            } else {
                botMessage.content = `Sorry, I couldn't find any dorm with the end date ${entityMap.enddate}.`;
            }
        }
        else if (entityMap.status) {
            const foundDorm = await Dorm.findOne({ "status": entityMap.status });

            if (foundDorm) {
                botMessage.content = `The status of the dorm is ${foundDorm.status}.`;
            } else {
                botMessage.content = `Sorry, I couldn't find any dorm with the status ${entityMap.status}.`;
            }
        }

        await botMessage.save();
        return res.status(200).json({ data: { response: botMessage.content } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong! Please try again." });
    }
};

// Helper function to process user search results and format the response
async function processUserResults(users, botMessage, res, searchTerm, searchType = 'fullName') {
    if (users.length === 1) {
        const { _id, firstName, lastName, email, phoneNumber } = users[0];

        // Find tenant info to get room details
        const tenantInfo = await Tenant.findOne({ userId: _id });
        let roomInfo = "Not assigned";

        if (tenantInfo && tenantInfo.roomId) {
            const room = await Dorm.findOne({ _id: tenantInfo.roomId });
            if (room) {
                roomInfo = room.roomNumber;
            }
        }

        const startDate = tenantInfo ? formatDate(tenantInfo.startDate) : "Not specified";
        const endDate = tenantInfo ? formatDate(tenantInfo.endDate) : "Not specified";
        const paymentStatus = tenantInfo ? tenantInfo.paymentStatus : "Not specified";

        botMessage.content = `${firstName} ${lastName} has the ID ${_id} and currently lives in room number ${roomInfo}. You may contact them via their email (${email}) or phone number (+63${phoneNumber}). The contract starts on ${startDate} and ends on ${endDate}. The payment status is ${paymentStatus}.`;
        await botMessage.save();

        return res.status(200).json({ data: { response: botMessage.content } });
    } else if (users.length > 1) {
        let message = searchType === 'fullName' 
            ? `It appears that there are multiple people named ${searchTerm}:\n`
            : `It appears that there are multiple users with the ${searchType} ${searchTerm}:\n`;

        for (const user of users) {
            const { _id, firstName, lastName } = user;

            // Find tenant info to get room details
            const tenantInfo = await Tenant.findOne({ userId: _id });
            let roomInfo = "Not assigned";

            if (tenantInfo && tenantInfo.roomId) {
                const room = await Dorm.findOne({ _id: tenantInfo.roomId });
                if (room) {
                    roomInfo = room.roomNumber;
                }
            }

            const startDate = tenantInfo ? formatDate(tenantInfo.startDate) : "Not specified";
            const endDate = tenantInfo ? formatDate(tenantInfo.endDate) : "Not specified";
            const paymentStatus = tenantInfo ? tenantInfo.paymentStatus : "Not specified";

            message += `(${_id}) ${firstName} ${lastName} from room ${roomInfo}. The contract starts on ${startDate} and ends on ${endDate}. The payment status is ${paymentStatus}.\n`;
        }

        message += "\n\nThose are the found users, please let me know if I can assist you more.";
        botMessage.content = message;
    } else {
        botMessage.content = searchType === 'fullName' 
            ? `Sorry, I couldn't find anyone named ${searchTerm}.`
            : `Sorry, I couldn't find anyone with the ${searchType} ${searchTerm}.`;
    }
    
    await botMessage.save();
    return res.status(200).json({ data: { response: botMessage.content } });
}

const sendBotResponse = async (message, res) => {
    try {
        const prompts = await Prompt.find({});

        const values = await Promise.all(
            prompts.map(({ query }) => calculateSimilarity(message.content, query))
        );

        // Store the query value and the score
        let highestScore = [undefined, 0];
        for (const value of values) {
            if (value[1] >= highestScore[1]) {
                highestScore = [value[0], value[1]];
            }
        }

        if (highestScore[1] < 15) {
            const botMessage = await new Message({
                roomId: message.roomId,
                sender: message.receiver,
                receiver: message.sender,
                content: "I'm sorry, I don't have specific information on that query. Please contact the MlQU admin for more detailed assistance."
            }).save();

            return res.status(200).json({ data: { response: botMessage.content } });
        }

        for (const prompt of prompts) {
            if (highestScore[0] === prompt.query) {
                const botMessage = await new Message({
                    roomId: message.roomId,
                    sender: message.receiver,
                    receiver: message.sender,
                    content: prompt.response
                }).save();

                return res.status(200).json({ data: { response: botMessage.content } });
            }
        }
        return res.status(200).json({ message: "I'm sorry, I don't have specific information on that query. Please contact the MlQU admin for more detailed assistance." });
    } catch (error) {
        console.log(error);
    }

    return res.status(500).json({ message: "Something went wrong! Please try again." });
};

const createChatroom = async (userId, otherId) => {
    try {
        const chatroom = await new Chatroom().save();

        new ChatroomMembers({ chatroomId: chatroom["_id"], userId: userId }).save();
        new ChatroomMembers({ chatroomId: chatroom["_id"], userId: otherId }).save();

        if (chatroom) {
            return chatroom["_id"].toString();
        }
    } catch (error) {
        console.log(error);
    }

    return undefined;
};

exports.sendMessage = (req, res) => {
    const roomId = req.params.id;
    const admin = req.query?.admin;
    const { sender, receiver, content } = req.body;

    try {
        const message = new Message({ roomId, sender, receiver, content });
        message.save();

        if (admin && receiver === "673349dfb3adad07a8d18919") {
            return sendBotQuery(message, res);
        } else if (receiver === "673349dfb3adad07a8d18919") {
            return sendBotResponse(message, res);
        }

        return res.status(201).json({ message: `Message of User #${sender} has been successfully sent to User #${receiver}.` });
    } catch (error) {
        console.log(error);
    }

    return res.status(500).json({ message: "Something went wrong! Please try again." });
};

exports.getChatroom = async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.body.userId);
    const otherId = new mongoose.Types.ObjectId(req.body.otherId);

    try {
        const chatroom = await ChatroomMembers.aggregate([
            {
                $match: {
                    userId: { $in: [userId, otherId] }
                }
            },
            {
                $group: {
                    _id: "$chatroomId",
                    users: { $addToSet: "$_id" }
                }
            },
            {
                $match: {
                    "users.1": { $exists: true }
                }
            },
            {
                $project: {
                    chatroomId: "$_id",
                    _id: 0,
                }
            }
        ]);

        if (chatroom[0]) {
            return res.status(200).json({ data: { chatroomId: chatroom[0].chatroomId.toString() } });
        }

        const chatroomId = await createChatroom(userId, otherId);

        if (chatroomId) {
            return res.status(200).json({ data: { chatroomId } });
        }
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong! Please try again." });
    }

    return res.status(404).json({ message: "Could not find any chatrooms between you and this user." });
};

exports.getPrompts = async (req, res) => {
    try {
        const prompts = await Prompt.find();

        if (prompts) {
            return res.status(200).json({ data: { prompts } });
        }
    } catch (error) {
        console.log(error);
    }

    return res.status(200).json({
        message: "Could not find any existing prompts.",
        data: {
            prompts: []
        }
    });
};

exports.upsertPrompt = async (req, res) => {
    try {
        const { _id, query, response } = req.body;

        if (_id) {
            const update = await Prompt.findOneAndUpdate({
                "_id": new mongoose.Types.ObjectId(_id),
                query,
                response
            });

            if (update) {
                return res.status(200).json({ message: `Prompt with ID ${_id} has been updated successfully.` });
            }
        } else {
            const insert = await Prompt({
                query,
                response
            }).save();

            if (insert) {
                return res.status(200).json({ message: `A new prompt has been added successfully.` });
            }
        }
    } catch (error) {
        console.log(error);
    }

    return res.status(200).json({ message: "Could not successfully insert/update the prompt, please try again." });
};

exports.deletePrompt = async (req, res) => {
    try {
        const { _id } = req.body;

        const prompt = await Prompt.findOneAndDelete({
            "_id": new mongoose.Types.ObjectId(_id),
        });

        if (prompt) {
            return res.status(200).json({ message: `Prompt with ID ${_id} has been deleted successfully.` });
        }
    } catch (error) {
        console.log(error);
    }

    return res.status(200).json({ message: "Could not successfully delete the prompt, please try again." });
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message
            .find({ roomId: req.params.id })
            .select("sender receiver content createdAt updatedAt");

        if (messages.length > 0) {
            return res.status(200).json({ data: { messages } });
        }

    } catch (error) {
        console.log(error);
    }

    return res.status(200).json({
        message: "Could not find any existing messages.",
        data: {
            messages: []
        }
    });
};