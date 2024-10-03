import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Input, Select, Modal, Form, 
  Tabs, Card, LineChart, BarChart 
} from '../../components/layouts/ui';
import { 
  Search, Edit, Trash, Download, Plus, 
  DollarSign, Tool, Users, FileText 
} from 'lucide-react';

const AdminRecordsManagement = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, searchTerm, filterType]);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/records');
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const applyFilters = () => {
    let filtered = records;
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(record => record.status === filterType);
    }
    setFilteredRecords(filtered);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (value) => {
    setFilterType(value);
  };

  const handleAddRecord = () => {
    setCurrentRecord(null);
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleEditRecord = (record) => {
    setCurrentRecord(record);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleDeleteRecord = (record) => {
    setCurrentRecord(record);
    setModalType('delete');
    setIsModalOpen(true);
  };

  const handleSaveRecord = async (recordData) => {
    try {
      const url = modalType === 'edit' ? `/api/records/${currentRecord.id}` : '/api/records';
      const method = modalType === 'edit' ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
      });
      if (response.ok) {
        fetchRecords();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/records/${currentRecord.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchRecords();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const handleExportRecords = () => {
    // Implement export functionality (CSV, PDF)
    console.log('Exporting records...');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tenant Records Management</h1>
      
      <div className="flex mb-4">
        <div className="relative w-64 mr-4">
          <Input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        <Select
          value={filterType}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="w-40 mr-4"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>

        <Button onClick={handleAddRecord} className="flex items-center mr-2">
          <Plus className="mr-2" /> Add Record
        </Button>

        <Button onClick={handleExportRecords} className="flex items-center">
          <Download className="mr-2" /> Export
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Room</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map(record => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>{record.name}</td>
              <td>{record.roomNumber}</td>
              <td>{record.status}</td>
              <td>
                <Button onClick={() => handleEditRecord(record)} className="mr-2">
                  <Edit className="mr-1" /> Edit
                </Button>
                <Button onClick={() => handleDeleteRecord(record)} variant="danger">
                  <Trash className="mr-1" /> Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Add Record' : modalType === 'edit' ? 'Edit Record' : 'Delete Record'}
      >
        {modalType === 'delete' ? (
          <DeleteConfirmation
            record={currentRecord}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setIsModalOpen(false)}
          />
        ) : (
          <RecordForm
            record={currentRecord}
            onSave={handleSaveRecord}
            onCancel={() => setIsModalOpen(false)}
          />
        )}
      </Modal>

      <h2 className="text-xl font-bold mt-8 mb-4">Record Details</h2>
      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { id: 'personal', label: 'Personal Info' },
          { id: 'payment', label: 'Payment History' },
          { id: 'maintenance', label: 'Maintenance' },
          { id: 'visitors', label: 'Visitors' },
        ]}
      >
        {activeTab === 'personal' && <PersonalInfoTab record={currentRecord} />}
        {activeTab === 'payment' && <PaymentHistoryTab record={currentRecord} />}
        {activeTab === 'maintenance' && <MaintenanceTab record={currentRecord} />}
        {activeTab === 'visitors' && <VisitorsTab record={currentRecord} />}
      </Tabs>

      <h2 className="text-xl font-bold mt-8 mb-4">Statistics and Analytics</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="text-lg font-semibold mb-2">Occupancy Rates</h3>
          <LineChart data={occupancyData} />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Maintenance Request Trends</h3>
          <BarChart data={maintenanceData} />
        </Card>
      </div>
    </div>
  );
};

// Placeholder components for the tabs and forms
const PersonalInfoTab = ({ record }) => (
  <div>Personal Info Content</div>
);

const PaymentHistoryTab = ({ record }) => (
  <div>Payment History Content</div>
);

const MaintenanceTab = ({ record }) => (
  <div>Maintenance Requests Content</div>
);

const VisitorsTab = ({ record }) => (
  <div>Visitors Log Content</div>
);

const RecordForm = ({ record, onSave, onCancel }) => (
  <div>Record Form Content</div>
);

const DeleteConfirmation = ({ record, onConfirm, onCancel }) => (
  <div>Delete Confirmation Content</div>
);

// Placeholder data for charts
const occupancyData = [
  { month: 'Jan', rate: 0.8 },
  { month: 'Feb', rate: 0.85 },
  { month: 'Mar', rate: 0.9 },
  { month: 'Apr', rate: 0.88 },
];

const maintenanceData = [
  { category: 'Plumbing', count: 15 },
  { category: 'Electrical', count: 8 },
  { category: 'HVAC', count: 12 },
  { category: 'General', count: 20 },
];

export default AdminRecordsManagement;