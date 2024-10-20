import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminContentTemplate from './AdminContentTemplate';
import {
  Users, BarChart2, Upload, Search, Filter, ChevronDown,
  Plus, Download, ChevronLeft, ChevronRight, Calendar,
  Clock, UserPlus, RefreshCw, AlertTriangle, Check, X
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '../../components/layouts/ui/alert';
import Button from '../../components/layouts/ui/Button';
import { Input } from '../../components/layouts/ui/Input';
import { Select } from '../../components/layouts/ui/Select';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/layouts/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/layouts/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/layouts/ui/Tabs';
import Popover, { PopoverTrigger, PopoverContent } from '../../components/layouts/ui/popover';
import DatePicker from '../../components/layouts/ui/date-picker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    purpose: '',
    date: '',
    timeIn: '',
    timeOut: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchVisitors(),
        fetchVisitorLogs()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAlertMessage('Error loading data. Please try again.');
      setShowAlert(true);
    }
    setIsLoading(false);
  };

  // Simulated API calls (replace with actual API calls in a real application)
  const fetchVisitors = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockVisitors = [
          { id: 1, name: 'John Doe', contact: '123-456-7890', purpose: 'Meeting', date: '2024-10-05', timeIn: '09:00', timeOut: '11:00', status: 'Approved' },
          { id: 2, name: 'Jane Smith', contact: '987-654-3210', purpose: 'Delivery', date: '2024-10-06', timeIn: '14:00', timeOut: '14:30', status: 'Pending' },
          // Add more mock data as needed
        ];
        setVisitors(mockVisitors);
        resolve();
      }, 1000);
    });
  };

  const fetchVisitorLogs = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockLogs = [
          { id: 1, visitorName: 'John Doe', date: '2024-10-05', timeIn: '09:00', timeOut: '11:00' },
          { id: 2, visitorName: 'Jane Smith', date: '2024-10-06', timeIn: '14:00', timeOut: '14:30' },
          // Add more mock data as needed
        ];
        setVisitorLogs(mockLogs);
        resolve();
      }, 800);
    });
  };

  const handleApproveReject = (visitorId, newStatus) => {
    const updatedVisitors = visitors.map(visitor =>
      visitor.id === visitorId ? { ...visitor, status: newStatus } : visitor
    );
    setVisitors(updatedVisitors);
    setAlertMessage(`Visitor ${newStatus.toLowerCase()} successfully`);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (date) => {
    setFilterDate(date);
    setCurrentPage(1);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newVisitor = {
      id: visitors.length + 1,
      ...formData,
      status: 'Pending'
    };
    setVisitors([...visitors, newVisitor]);
    setShowForm(false);
    setFormData({
      name: '',
      contact: '',
      purpose: '',
      date: '',
      timeIn: '',
      timeOut: '',
    });
    setAlertMessage('New visitor added successfully');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const filteredVisitors = visitors.filter(visitor =>
    visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'all' || visitor.status === filterStatus) &&
    (!filterDate || visitor.date === filterDate.toISOString().split('T')[0])
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVisitors = filteredVisitors.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportVisitorLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Visitor Name,Date,Time In,Time Out\n"
      + visitorLogs.map(log => `${log.visitorName},${log.date},${log.timeIn},${log.timeOut}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "visitor_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDashboardSummary = () => {
    const todayVisitors = visitors.filter(v => v.date === new Date().toISOString().split('T')[0]);
    const pendingApprovals = visitors.filter(v => v.status === 'Pending');
    const lastWeekVisitors = visitors.filter(v => {
      const visitDate = new Date(v.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return visitDate >= weekAgo;
    });

    const visitorTrend = [
      { name: 'Mon', visitors: 4 },
      { name: 'Tue', visitors: 3 },
      { name: 'Wed', visitors: 5 },
      { name: 'Thu', visitors: 7 },
      { name: 'Fri', visitors: 6 },
      { name: 'Sat', visitors: 4 },
      { name: 'Sun', visitors: 5 },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Visitors Today</h3>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayVisitors.length}</div>
              <p className="text-xs text-muted-foreground">
                +{Math.floor(Math.random() * 10)}% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Pending Approvals</h3>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApprovals.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingApprovals.length > 5 ? 'Requires attention' : 'Within normal range'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Weekly Visitor Average</h3>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(lastWeekVisitors.length / 7)}</div>
              <p className="text-xs text-muted-foreground">
                {lastWeekVisitors.length} visitors in the last 7 days
              </p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Visitor Trend (Last 7 Days)</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visitorTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="visitors" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderVisitorList = () => (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <h3 className="text-xl font-semibold">Registered Visitors</h3>
          <Button onClick={() => setShowForm(true)}>
            <UserPlus size={16} className="mr-2" />
            Add New Visitor
          </Button>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 mt-4">
          <div className="flex items-center w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search visitors..."
              value={searchTerm}
              onChange={handleSearch}
              className="mr-2"
            />
            <Search size={20} className="text-gray-500" />
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Select value={filterStatus} onValueChange={handleFilterChange}>
              <Select.Trigger className="w-[150px]">
                <Select.Value placeholder="Filter by status" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All Status</Select.Item>
                <Select.Item value="Approved">Approved</Select.Item>
                <Select.Item value="Pending">Pending</Select.Item>
                <Select.Item value="Rejected">Rejected</Select.Item>
              </Select.Content>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[150px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  {filterDate ? filterDate.toDateString() : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <DatePicker
                  mode="single"
                  selected={filterDate}
                  onSelect={handleDateFilterChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Time</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentVisitors.map(visitor => (
                <motion.tr
                  key={visitor.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b"
                >
                  <td className="p-2">{visitor.name}</td>
                  <td className="p-2">{visitor.date}</td>
                  <td className="p-2">{visitor.timeIn} - {visitor.timeOut}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${visitor.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        visitor.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {visitor.status}
                    </span>
                  </td>
                  <td className="p-2">
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => setSelectedVisitor(visitor)}>
                      View
                    </Button>
                    {visitor.status === 'Pending' && (
                      <>
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleApproveReject(visitor.id, 'Approved')}>
                          <Check size={16} className="mr-1" /> Approve
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleApproveReject(visitor.id, 'Rejected')}>
                          <X size={16} className="mr-1" /> Reject
                        </Button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </CardContent>
    </Card>
  );

  const renderPagination = () => (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
      </Button>
      <span>{currentPage} of {Math.ceil(filteredVisitors.length / itemsPerPage)}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === Math.ceil(filteredVisitors.length / itemsPerPage)}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );

  const renderVisitorDetails = () => (
    <Dialog open={!!selectedVisitor} onOpenChange={() => setSelectedVisitor(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Visitor Details</DialogTitle>
        </DialogHeader>
        {selectedVisitor && (
          <div className="space-y-2">
            <p><strong>Name:</strong> {selectedVisitor.name}</p>
            <p><strong>Contact:</strong> {selectedVisitor.contact}</p>
            <p><strong>Purpose:</strong> {selectedVisitor.purpose}</p>
            <p><strong>Date:</strong> {selectedVisitor.date}</p>
            <p><strong>Time In:</strong> {selectedVisitor.timeIn}</p>
            <p><strong>Time Out:</strong> {selectedVisitor.timeOut}</p>
            <p><strong>Status:</strong> {selectedVisitor.status}</p>
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => setSelectedVisitor(null)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderVisitorForm = () => (
    <Dialog open={showForm} onOpenChange={setShowForm}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Visitor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            placeholder="Visitor Name"
            required
          />
          <Input
            name="contact"
            value={formData.contact}
            onChange={handleFormChange}
            placeholder="Contact Number"
            required
          />
          <Input
            name="purpose"
            value={formData.purpose}
            onChange={handleFormChange}
            placeholder="Purpose of Visit"
            required
          />
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleFormChange}
            required
          />
          <div className="flex space-x-4">
            <Input
              type="time"
              name="timeIn"
              value={formData.timeIn}
              onChange={handleFormChange}
              required
            />
            <Input
              type="time"
              name="timeOut"
              value={formData.timeOut}
              onChange={handleFormChange}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Visitor</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderVisitorLogs = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Visitor Logs</h3>
          <Button onClick={exportVisitorLogs}>
            <Download size={16} className="mr-2" />
            Export Logs
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Visitor Name</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Time In</th>
                <th className="p-2 text-left">Time Out</th>
              </tr>
            </thead>
            <tbody>
              {visitorLogs.map(log => (
                <tr key={log.id} className="border-b">
                  <td className="p-2">{log.visitorName}</td>
                  <td className="p-2">{log.date}</td>
                  <td className="p-2">{log.timeIn}</td>
                  <td className="p-2">{log.timeOut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white text-black p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-semibold mb-2">Visitor Management</h1>
        <p className="text-black-100">Manage and track visitors in the dormitory</p>
      </div>

      {showAlert && (
        <Alert className="mb-6">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="animate-spin h-8 w-8 text-teal-500" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">
              <BarChart2 size={16} className="mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="registered">
              <Users size={16} className="mr-2" />
              Registered Visitors
            </TabsTrigger>
            <TabsTrigger value="logs">
              <Users size={16} className="mr-2" />
              Visitor Logs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            {renderDashboardSummary()}
          </TabsContent>
          <TabsContent value="registered">

            {renderVisitorList()}
          </TabsContent>
          <TabsContent value="logs">
            {renderVisitorLogs()}
          </TabsContent>
        </Tabs>
      )}

      {renderVisitorDetails()}
      {renderVisitorForm()}
    </div>
  );
};


export default AdminVisitors;