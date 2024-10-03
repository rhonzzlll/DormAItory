import React, { useState, useEffect } from 'react';
import {
  Users, FileText, BarChart2, Upload, MessageSquare,
  Check, X, Search, Filter, ChevronDown, Flag
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '../../components/layouts/ui/alert';

const AdminVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('registered');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    // Simulating API calls to fetch data
    fetchVisitors();
    fetchVisitorLogs();
    fetchFeedback();
    fetchDocuments();
  }, []);

  const fetchVisitors = () => {
    // Simulated API call
    const mockVisitors = [
      { id: 1, name: 'John Doe', contact: '123-456-7890', purpose: 'Meeting', date: '2024-10-05', timeIn: '09:00', timeOut: '11:00', status: 'Approved' },
      { id: 2, name: 'Jane Smith', contact: '987-654-3210', purpose: 'Delivery', date: '2024-10-06', timeIn: '14:00', timeOut: '14:30', status: 'Pending' },
      // Add more mock data as needed
    ];
    setVisitors(mockVisitors);
  };

  const fetchVisitorLogs = () => {
    // Simulated API call
    const mockLogs = [
      { id: 1, visitorName: 'John Doe', date: '2024-10-05', timeIn: '09:00', timeOut: '11:00' },
      { id: 2, visitorName: 'Jane Smith', date: '2024-10-06', timeIn: '14:00', timeOut: '14:30' },
      // Add more mock data as needed
    ];
    setVisitorLogs(mockLogs);
  };

  const fetchFeedback = () => {
    // Simulated API call
    const mockFeedback = [
      { id: 1, tenantName: 'Alice Johnson', message: 'Great experience with my visitor!', date: '2024-10-07' },
      { id: 2, tenantName: 'Bob Williams', message: 'The check-in process was smooth.', date: '2024-10-08' },
      // Add more mock data as needed
    ];
    setFeedback(mockFeedback);
  };

  const fetchDocuments = () => {
    // Simulated API call
    const mockDocuments = [
      { id: 1, title: 'Visitor Guidelines', description: 'General rules for visitors', uploadDate: '2024-09-01' },
      { id: 2, title: 'Consent Form', description: 'Visitor consent form template', uploadDate: '2024-09-15' },
      // Add more mock data as needed
    ];
    setDocuments(mockDocuments);
  };

  const handleApproveReject = (visitorId, newStatus) => {
    const updatedVisitors = visitors.map(visitor =>
      visitor.id === visitorId ? { ...visitor, status: newStatus } : visitor
    );
    setVisitors(updatedVisitors);
    setAlertMessage(`Visitor ${newStatus.toLowerCase()}`);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const filteredVisitors = visitors.filter(visitor =>
    visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'all' || visitor.status === filterStatus)
  );

  const renderVisitorList = () => (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search visitors..."
            className="p-2 border rounded mr-2"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search size={20} className="text-gray-500" />
        </div>
        <div className="flex items-center">
          <Filter size={20} className="text-gray-500 mr-2" />
          <select
            className="p-2 border rounded"
            value={filterStatus}
            onChange={handleFilterChange}
          >
            <option value="all">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Name</th>
            <th className="py-2 px-4 border-b text-left">Date</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVisitors.map(visitor => (
            <tr key={visitor.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{visitor.name}</td>
              <td className="py-2 px-4 border-b">{visitor.date}</td>
              <td className="py-2 px-4 border-b">{visitor.status}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => setSelectedVisitor(visitor)}
                  className="text-blue-600 hover:text-blue-800 mr-2"
                >
                  View
                </button>
                {visitor.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleApproveReject(visitor.id, 'Approved')}
                      className="text-green-600 hover:text-green-800 mr-2"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => handleApproveReject(visitor.id, 'Rejected')}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={20} />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderVisitorDetails = () => {
    if (!selectedVisitor) return null;
    return (
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-2">Visitor Details</h3>
        <p><strong>Name:</strong> {selectedVisitor.name}</p>
        <p><strong>Contact:</strong> {selectedVisitor.contact}</p>
        <p><strong>Purpose:</strong> {selectedVisitor.purpose}</p>
        <p><strong>Date:</strong> {selectedVisitor.date}</p>
        <p><strong>Time In:</strong> {selectedVisitor.timeIn}</p>
        <p><strong>Time Out:</strong> {selectedVisitor.timeOut}</p>
        <p><strong>Status:</strong> {selectedVisitor.status}</p>
        <button
          onClick={() => setSelectedVisitor(null)}
          className="mt-4 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    );
  };

  const renderVisitorLogs = () => (
    <div>
      <h3 className="text-xl font-semibold mb-4">Visitor Logs</h3>
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Visitor Name</th>
            <th className="py-2 px-4 border-b text-left">Date</th>
            <th className="py-2 px-4 border-b text-left">Time In</th>
            <th className="py-2 px-4 border-b text-left">Time Out</th>
          </tr>
        </thead>
        <tbody>
          {visitorLogs.map(log => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{log.visitorName}</td>
              <td className="py-2 px-4 border-b">{log.date}</td>
              <td className="py-2 px-4 border-b">{log.timeIn}</td>
              <td className="py-2 px-4 border-b">{log.timeOut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderFeedback = () => (
    <div>
      <h3 className="text-xl font-semibold mb-4">Visitor Feedback</h3>
      {feedback.map(item => (
        <div key={item.id} className="bg-white p-4 rounded shadow mb-4">
          <p className="font-semibold">{item.tenantName}</p>
          <p className="text-gray-600">{item.date}</p>
          <p className="mt-2">{item.message}</p>
        </div>
      ))}
    </div>
  );

  const renderDocuments = () => (
    <div>
      <h3 className="text-xl font-semibold mb-4">Uploaded Documents</h3>
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">Title</th>
            <th className="py-2 px-4 border-b text-left">Description</th>
            <th className="py-2 px-4 border-b text-left">Upload Date</th>
            <th className="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(doc => (
            <tr key={doc.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{doc.title}</td>
              <td className="py-2 px-4 border-b">{doc.description}</td>
              <td className="py-2 px-4 border-b">{doc.uploadDate}</td>
              <td className="py-2 px-4 border-b">
                <button className="text-blue-600 hover:text-blue-800 mr-2">View</button>
                <button className="text-red-600 hover:text-red-800">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-teal-600 text-white p-6 rounded-t-lg">
        <h1 className="text-3xl font-semibold mb-2">Admin Visitor Management</h1>
        <p className="text-sm">
          Manage visitor registrations, logs, feedback, and documents.
        </p>
      </div>

      <div className="bg-white p-6 rounded-b-lg shadow-lg">
        <div className="flex mb-6">
          <button
            className={`mr-4 ${activeTab === 'registered' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('registered')}
          >
            <Users className="inline-block mr-2" size={20} />
            Registered Visitors
          </button>
          <button
            className={`mr-4 ${activeTab === 'logs' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('logs')}
          >
            <FileText className="inline-block mr-2" size={20} />
            Visitor Logs
          </button>
          <button
            className={`mr-4 ${activeTab === 'feedback' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('feedback')}
          >
            <MessageSquare className="inline-block mr-2" size={20} />
            Feedback
          </button>
          <button
            className={`mr-4 ${activeTab === 'documents' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('documents')}
          >
            <Upload className="inline-block mr-2" size={20} />
            Documents
          </button>
        </div>

        {showAlert && (
          <Alert className="mb-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              {alertMessage}
            </AlertDescription>
          </Alert>
        )}

        {activeTab === 'registered' && renderVisitorList()}
        {activeTab === 'logs' && renderVisitorLogs()}
        {activeTab === 'feedback' && renderFeedback()}
        {activeTab === 'documents' && renderDocuments()}

        {selectedVisitor && renderVisitorDetails()}
      </div>
    </div>
  );
};

export default AdminVisitors;