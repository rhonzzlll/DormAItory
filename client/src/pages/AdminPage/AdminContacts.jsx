import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Mail, Trash2, CheckCircle, AlertCircle, Search, 
  ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/layouts/ui/alert';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/messages');
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setAlertMessage('Failed to fetch messages. Please try again.');
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/messages/${id}`, { status });
      setMessages(messages.map(message => (message._id === id ? { ...message, status } : message)));
      setAlertMessage(`Message marked as ${status}`);
      setShowAlert(true);
    } catch (error) {
      console.error('Error updating message:', error);
      setAlertMessage('Failed to update message status. Please try again.');
      setShowAlert(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/messages/${id}`);
      setMessages(messages.filter(message => message._id !== id));
      setAlertMessage('Message deleted successfully');
      setShowAlert(true);
    } catch (error) {
      console.error('Error deleting message:', error);
      setAlertMessage('Failed to delete message. Please try again.');
      setShowAlert(true);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedMessages = [...messages].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredMessages = sortedMessages.filter(message =>
    message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-teal-600">Contact Messages</h1>
      
      {showAlert && (
        <Alert className="mb-4">
          <AlertTitle>Notification</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      <div className="mb-4 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredMessages.length} of {messages.length} messages
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Sender Name', 'Email', 'Subject', 'Status', 'Actions'].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort(header.toLowerCase().replace(' ', ''))}
                >
                  <div className="flex items-center">
                    {header}
                    {sortField === header.toLowerCase().replace(' ', '') && (
                      sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <tr key={message._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{message.senderName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{message.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{message.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    message.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {message.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="text-teal-600 hover:text-teal-900 mr-3"
                    onClick={() => setSelectedMessage(message)}
                  >
                    <ExternalLink size={18} />
                  </button>
                  <button
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                    onClick={() => handleStatusChange(message._id, message.status === 'Pending' ? 'Read' : 'Pending')}
                  >
                    {message.status === 'Pending' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDelete(message._id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedMessage.subject}</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  From: {selectedMessage.senderName} ({selectedMessage.email})
                </p>
                <p className="text-sm text-gray-500 mt-4">{selectedMessage.message}</p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-teal-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  onClick={() => setSelectedMessage(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;