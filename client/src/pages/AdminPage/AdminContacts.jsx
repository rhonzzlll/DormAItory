import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/layouts//ui/Card';
import  Button  from '../../components/layouts//ui/Button';
import { Input } from '../../components/layouts//ui/Input';
import { Badge } from '../../components/layouts/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/layouts//ui/Select';
import { MessageCircle, Clock, MapPin, Phone, User, Send, Plus, Filter } from 'lucide-react';

const MESSAGE_CATEGORIES = [
  "General Inquiry",
  "Maintenance Request",
  "Billing Issue",
  "Security Concern"
];

const ADMIN_INFO = {
  name: "Admin",
  contact: "+63 945 840 5527",
  location: "Arlegui Dormitory, Arlegui St., Quiapo, Manila",
  hours: "Mon-Fri: 9:00 AM - 5:00 PM"
};

const UnifiedMessaging = ({ userRole = 'tenant' }) => {
  const [messages, setMessages] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [recipient, setRecipient] = useState("");

  // Mock message for demonstration
  const mockMessages = [
    {
      id: 1,
      sender: userRole === 'admin' ? "John Doe (Room 302)" : "Admin",
      subject: "Maintenance Request",
      category: "Maintenance Request",
      content: "The sink in room 302 is leaking.",
      status: "unread",
      timestamp: new Date().toISOString(),
      room: "302"
    }
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedCategory || !subject.trim()) return;

    const message = {
      id: Date.now(),
      sender: userRole === 'admin' ? 'Admin' : 'Tenant',
      subject: subject,
      category: selectedCategory,
      content: newMessage,
      status: "unread",
      timestamp: new Date().toISOString(),
      room: userRole === 'tenant' ? "302" : "N/A" // Replace with actual room number for tenant
    };

    setMessages([...messages, message]);
    setNewMessage("");
    setSubject("");
    setSelectedCategory("");
    setIsComposeVisible(false);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{userRole === 'admin' ? 'Admin Message Dashboard' : 'Message Center'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" onClick={() => setIsComposeVisible(!isComposeVisible)}>
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>
          {userRole === 'tenant' && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center">
                <User className="mr-2" />
                <span>{ADMIN_INFO.name}</span>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2" />
                <span>{ADMIN_INFO.contact}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2" />
                <span>{ADMIN_INFO.location}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2" />
                <span>{ADMIN_INFO.hours}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compose New Message Section */}
      {isComposeVisible && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>New Message</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userRole === 'admin' && (
                <Input
                  placeholder="Recipient (Room Number)"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              )}
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
              <Button onClick={handleSendMessage}>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Message List */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {mockMessages.map(message => (
                <div
                  key={message.id}
                  onClick={() => setSelectedThread(message)}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{message.sender}</div>
                      <div className="text-sm text-gray-500">{message.subject}</div>
                    </div>
                    <Badge variant={message.status === 'unread' ? 'destructive' : 'default'}>
                      {message.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Message Thread */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedThread ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{selectedThread.subject}</h3>
                      <p className="text-sm text-gray-500">
                        From: {selectedThread.sender}
                      </p>
                      <p className="text-sm text-gray-500">
                        Category: {selectedThread.category}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedThread.content}
                  </div>
                  {/* Reply Form */}
                  <div className="mt-4">
                    <Input
                      placeholder="Type your reply..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="mb-2"
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="w-4 h-4 mr-2" />
                      Send     Reply
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
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

export default UnifiedMessaging;