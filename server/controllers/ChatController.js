const mongoose = require('mongoose');
const Chatroom = require("../models/chatroom");
const ChatroomMembers = require("../models/chatroomMembers");
const Prompt = require("../models/prompt");
const Message = require("../models/message");

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

        new ChatroomMembers({ chatroomId: chatroom["_id"], userId: userId}).save();
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
    const { sender, receiver, content } = req.body;

    try {
        const message = new Message({ roomId, sender, receiver, content });
        message.save();

        if (receiver === "67258d7c80b699eba26fcece") {
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

        const chatroomId = createChatroom(userId, otherId);

        if (chatroomId) {
            return res.status(200).json({ data: { chatroomId }});
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
                return res.status(200).json({ message: `Prompt with ID ${id} has been updated successfully.` });
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
            return res.status(200).json({ message: `Prompt with ID ${id} has been deleted successfully.` });
        }
    } catch (error) {
        console.log(error);
    }

    return res.status(200).json({ message: "Could not successfully delete the prompt, please try again." });
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message
            .find({ roomId: new mongoose.Types.ObjectId(req.params.id) })
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
}