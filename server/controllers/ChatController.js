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

/**
 * Helper function to format user information as a bulleted list
 */
const formatUserInfo = (user, tenantInfo, roomInfo, includeId = true) => {
    const { _id, firstName, lastName, email, phoneNumber } = user;
    const startDate = tenantInfo ? formatDate(tenantInfo.startDate) : "Not specified";
    const endDate = tenantInfo ? formatDate(tenantInfo.endDate) : "Not specified";
    const paymentStatus = tenantInfo ? tenantInfo.paymentStatus : "Not specified";
    const rentAmount = tenantInfo ? tenantInfo.rentAmount : "Not specified";

    let userInfo = `👤 **${firstName} ${lastName}**\n`;
    
    if (includeId) {
        userInfo += `   • ID: ${_id}\n`;
    }
    
    userInfo += `   • Room: ${roomInfo}\n`;
    userInfo += `   • Email: ${email}\n`;
    userInfo += `   • Phone: +63${phoneNumber}\n`;
    userInfo += `   • Contract Period: ${startDate} to ${endDate}\n`;
    userInfo += `   • Payment Status: ${paymentStatus}\n`;
    
    if (rentAmount !== "Not specified") {
        userInfo += `   • Rent Amount: ${rentAmount} pesos\n`;
    }

    return userInfo;
};

/**
 * Helper function to format room amenities as a bulleted list
 */
const formatAmenities = (amenities) => {
    let amenitiesList = "";
    
    if (amenities.aircon) {
        amenitiesList += "   • ❄️ Air Conditioning\n";
    } else {
        amenitiesList += "   • ❌ No Air Conditioning\n";
    }
    
    if (amenities.wifi) {
        amenitiesList += "   • 📶 WiFi Available\n";
    } else {
        amenitiesList += "   • ❌ No WiFi\n";
    }
    
    if (amenities.bathroom) {
        amenitiesList += "   • 🚿 Private Bathroom\n";
    } else {
        amenitiesList += "   • ❌ No Private Bathroom\n";
    }
    
    return amenitiesList;
};

const sendBotQuery = async (message, res) => {
    try {
        const req = await fetch("http://localhost:5005/model/parse", {
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
            botMessage.content = "🤔 Sorry, could you please be more specific with your query. Thank you!\n\n💡 **Try asking about:**\n   • User names (first/last name)\n   • Room numbers\n   • User IDs\n   • Payment status\n   • Contract dates";
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

                const userInfoFormatted = formatUserInfo(foundUser, tenantInfo, roomInfo, false);
                botMessage.content = `✅ **User Found!**\n\n${userInfoFormatted}`;
            } else {
                botMessage.content = `❌ **User Not Found**\n\n🔍 Sorry, I couldn't find anyone with the ID: **${entityMap._id}**\n\n💡 **Tip:** Please double-check the user ID and try again.`;
            }
        }
        else if (entityMap.roomNumber) {
            // Handle room number queries with enhanced formatting
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
                const room = foundDorm[0];
                
                let message = `🏠 **Room ${entityMap.roomNumber} Information**\n\n`;
                message += `📊 **Room Details:**\n`;
                message += `   • Occupancy: ${room.occupied}/${room.capacity} people\n`;
                message += `   • Price: ${room.price} pesos\n\n`;
                
                message += `🛏️ **Amenities:**\n`;
                message += formatAmenities(room.amenities);

                if (room.occupied === 0) {
                    message += `\n✅ **Availability:** This room is currently vacant.`;
                } else {
                    message += `\n👥 **Current Tenants:**\n\n`;

                    for (let i = 0; i < room.tenants.length; i++) {
                        const tenant = room.tenants[i];
                        message += `${i + 1}. **${tenant.info.firstName} ${tenant.info.lastName}**\n`;
                        message += `   • ID: ${tenant.userId}\n`;
                        message += `   • Rent: ${tenant.rentAmount} pesos\n`;
                        message += `   • Contract: ${formatDate(tenant.startDate)} to ${formatDate(tenant.endDate)}\n`;
                        message += `   • Payment Status: ${tenant.paymentStatus}\n\n`;
                    }
                }
                
                botMessage.content = message;
            } else {
                botMessage.content = `❌ **Room Not Found**\n\n🔍 Sorry, I couldn't find any information about room **${entityMap.roomNumber}**.\n\n💡 **Tip:** Please check the room number and try again.`;
            }
        }
        // Handle other entity types (startdate, enddate, status)
        else if (entityMap.startdate) {
            const foundDorm = await Dorm.findOne({ "startDate": entityMap.startdate });

            if (foundDorm) {
                botMessage.content = `📅 **Start Date Information**\n\n   • The start date for the dorm is: **${formatDate(foundDorm.startDate)}**`;
            } else {
                botMessage.content = `❌ **Date Not Found**\n\n🔍 Sorry, I couldn't find any dorm with the start date: **${entityMap.startdate}**`;
            }
        } 
        else if (entityMap.enddate) {
            const foundDorm = await Dorm.findOne({ "endDate": entityMap.enddate });

            if (foundDorm) {
                botMessage.content = `📅 **End Date Information**\n\n   • The end date for the dorm is: **${formatDate(foundDorm.endDate)}**`;
            } else {
                botMessage.content = `❌ **Date Not Found**\n\n🔍 Sorry, I couldn't find any dorm with the end date: **${entityMap.enddate}**`;
            }
        }
        else if (entityMap.status) {
            const foundDorm = await Dorm.findOne({ "status": entityMap.status });

            if (foundDorm) {
                botMessage.content = `📊 **Status Information**\n\n   • The status of the dorm is: **${foundDorm.status}**`;
            } else {
                botMessage.content = `❌ **Status Not Found**\n\n🔍 Sorry, I couldn't find any dorm with the status: **${entityMap.status}**`;
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
        const user = users[0];

        // Find tenant info to get room details
        const tenantInfo = await Tenant.findOne({ userId: user._id });
        let roomInfo = "Not assigned";

        if (tenantInfo && tenantInfo.roomId) {
            const room = await Dorm.findOne({ _id: tenantInfo.roomId });
            if (room) {
                roomInfo = room.roomNumber;
            }
        }

        const userInfoFormatted = formatUserInfo(user, tenantInfo, roomInfo);
        botMessage.content = `✅ **User Found!**\n\n${userInfoFormatted}`;
        
        await botMessage.save();
        return res.status(200).json({ data: { response: botMessage.content } });
        
    } else if (users.length > 1) {
        let message = searchType === 'fullName' 
            ? `👥 **Multiple Users Found: "${searchTerm}"**\n\n`
            : `👥 **Multiple Users Found with ${searchType}: "${searchTerm}"**\n\n`;

        message += `Found **${users.length}** users:\n\n`;

        for (let i = 0; i < users.length; i++) {
            const user = users[i];

            // Find tenant info to get room details
            const tenantInfo = await Tenant.findOne({ userId: user._id });
            let roomInfo = "Not assigned";

            if (tenantInfo && tenantInfo.roomId) {
                const room = await Dorm.findOne({ _id: tenantInfo.roomId });
                if (room) {
                    roomInfo = room.roomNumber;
                }
            }

            message += `**${i + 1}.** ${formatUserInfo(user, tenantInfo, roomInfo)}\n`;
        }

        message += `💡 **Need specific information?** Please provide the user ID or more details.`;
        botMessage.content = message;
        
    } else {
        botMessage.content = searchType === 'fullName' 
            ? `❌ **User Not Found**\n\n🔍 Sorry, I couldn't find anyone named **"${searchTerm}"**.\n\n💡 **Try:**\n   • Checking the spelling\n   • Using just first or last name\n   • Providing the user ID`
            : `❌ **User Not Found**\n\n🔍 Sorry, I couldn't find anyone with the ${searchType} **"${searchTerm}"**.\n\n💡 **Try:**\n   • Checking the spelling\n   • Using the full name\n   • Providing the user ID`;
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
                content: "❓ **Need More Help?**\n\n🔍 I don't have specific information on that query.\n\n📞 **Contact Options:**\n   • Reach out to the MlQU admin for detailed assistance\n   • Try rephrasing your question\n   • Ask about users, rooms, or payment status"
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
        return res.status(200).json({ message: "❓ **Need More Help?**\n\n🔍 I don't have specific information on that query.\n\n📞 **Contact Options:**\n   • Reach out to the MlQU admin for detailed assistance\n   • Try rephrasing your question\n   • Ask about users, rooms, or payment status" });
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