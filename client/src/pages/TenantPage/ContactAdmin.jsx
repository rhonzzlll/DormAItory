import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/layouts/ui/Card';
import Button from '../../components/layouts/ui/Button';
import { Input } from '../../components/layouts/ui/Input';
import { Badge } from '../../components/layouts/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/layouts/ui/Select';
import { Send, Plus, X, Trash } from 'lucide-react';

const MESSAGE_CATEGORIES = [
  "General Inquiry",
  "Maintenance Request",
  "Billing Issue",
  "Room Change"
];

const ContactAdmin = ({ userRole = 'tenant' }) => {
  const [messages, setMessages] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    status: ""
  });
  const [loading, setLoading] = useState(false);
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const userId = localStorage.getItem("_id");
      try {
        const [usersResponse, messagesResponse] = await Promise.all([
          axios.get('http://dormaitory.online:8080/api/users'),
          axios.get('http://dormaitory.online:8080/api/contact-messages')
        ]);

        const formattedUsers = usersResponse.data.map(user => ({
          _id: user._id,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        })).filter(user => user.fullName);

        const userNamesMap = formattedUsers.reduce((acc, user) => {
          acc[user._id] = user.fullName;
          return acc;
        }, {});
        setUserNames(userNamesMap);

        const userMessages = messagesResponse.data.filter(message => message.sender === userId || message.recipient === userId);
        const sortedMessages = userMessages.sort((a, b) =>
          new Date(b.timestamp) - new Date(a.timestamp)
        );

        setMessages(sortedMessages);
        localStorage.setItem('messages', JSON.stringify(sortedMessages));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    fetchData();
  }, []);

  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      const matchesSearch =
        message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userNames[message.sender]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.content?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !filters.category || message.category === filters.category;
      const matchesStatus = !filters.status || message.status === filters.status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [messages, searchQuery, filters, userNames]);

  
  const handleSendMessage = async () => {
    setLoading(true);
    const userId = localStorage.getItem("_id");
    const userFullName = userNames[userId];
    try {
      const messagePayload = {
        sender: userId,
        recipient: 'Admin',
        subject,
        category: selectedCategory,
        content: newMessage,
        status: 'unread',
        fullname: userFullName, // Ensure fullname is included
        senderFullName: userFullName,
        thread: [{
          sender: userId,
          senderFullName: userFullName,
          content: newMessage,
          timestamp: new Date()
        }]
      };
  
      console.log('Sending message payload:', messagePayload);
  
      if (selectedThread) {
        const response = await axios.put(
          `http://dormaitory.online:8080/api/contact-messages/${selectedThread._id}`,
          { thread: [...selectedThread.thread, messagePayload.thread[0]] }
        );
  
        console.log('Response from server (update):', response.data);
  
        const updatedMessages = messages.map(msg =>
          msg._id === selectedThread._id ? response.data : msg
        );
        setMessages(updatedMessages);
        localStorage.setItem('messages', JSON.stringify(updatedMessages));
        setSelectedThread(response.data);
      } else {
        const response = await axios.post(
          'http://dormaitory.online:8080/api/contact-messages',
          messagePayload
        );
  
        console.log('Response from server (create):', response.data);
  
        const updatedMessages = [response.data, ...messages];
        setMessages(updatedMessages);
        localStorage.setItem('messages', JSON.stringify(updatedMessages));
        setSelectedThread(response.data);
      }
  
      setNewMessage("");
      setSubject("");
      setSelectedCategory("");
      setIsComposeVisible(false);
    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleSelectThread = async (message) => {
    if (message.status === 'unread') {
      try {
        const response = await axios.put(
          `http://dormaitory.online:8080/api/contact-messages/${message._id}`,
          { status: 'read' }
        );

        const updatedMessages = messages.map(msg =>
          msg._id === message._id ? { ...msg, status: 'read' } : msg
        );
        setMessages(updatedMessages);
        localStorage.setItem('messages', JSON.stringify(updatedMessages));
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    }
    setSelectedThread(message);
  };

  const handleDeleteMessage = async (messageId) => {
    setLoading(true);
    try {
      await axios.delete(`http://dormaitory.online:8080/api/contact-messages/${messageId}`);
      const updatedMessages = messages.filter(message => message._id !== messageId);
      setMessages(updatedMessages);
      localStorage.setItem('messages', JSON.stringify(updatedMessages));
      if (selectedThread && selectedThread._id === messageId) {
        setSelectedThread(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({ category: "", status: "" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Message Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Select
              value={filters.category}
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {MESSAGE_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || filters.category || filters.status) && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}

            <Button
              onClick={() => {
                setIsComposeVisible(true);
                setSelectedThread(null);
              }}
              className="group relative overflow-hidden">
              <div className="flex items-center relative z-10">
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {isComposeVisible && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>New Message</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Message content"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="h-24"
              />
              <Button onClick={handleSendMessage} disabled={loading}>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No messages found
                </div>
              ) : (
                filteredMessages.map(message => (
                  <div
                    key={message._id}
                    onClick={() => handleSelectThread(message)}
                    className={`p-3 hover:bg-gray-100 cursor-pointer border-b ${selectedThread?._id === message._id ? 'bg-blue-50' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {userNames[message.sender] || message.sender}
                        </div>
                        <div className="text-sm text-gray-500">{message.subject}</div>
                      </div>
                      <Badge
                        variant={message.status === 'unread' ? 'destructive' : 'default'}>
                        {message.status}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(message._id);
                        }}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              {selectedThread ? (
                <div className="flex flex-col h-full">
                  <div className="flex-grow overflow-y-auto mb-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{selectedThread.subject}</h3>
                          <p className="text-sm text-gray-500">
                            {`To: Admin`}
                          </p>
                          <p className="text-sm text-gray-500">
                            Category: {selectedThread.category}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {selectedThread.thread.map((msg, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg ${msg.sender === 'Admin'
                              ? 'bg-blue-50 self-end text-right ml-auto'
                              : 'bg-gray-100 self-start text-left mr-auto'}`}>
                            <div className="font-medium text-sm mb-1">{msg.sender === 'Admin' ? 'Admin' : userNames[msg.sender]}</div>
                            <div>{msg.content}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(msg.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 h-12"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  Select a message to view the conversation
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactAdmin;