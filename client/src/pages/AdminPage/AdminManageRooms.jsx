import React, { useState, useEffect } from 'react';
import {
  Plus,
  Minus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Building,
  RefreshCw,
  Pencil,
  ChevronRight,
  DollarSign,
  Check,
  Clock
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/layouts/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/layouts/ui/table';
import { Alert, AlertDescription } from '../../components/layouts/ui/alert';
import Button from '../../components/layouts/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/layouts/ui/dialog';
import { Input } from '../../components/layouts/ui/Input';
import { Label } from '../../components/layouts/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/layouts/ui/Select';
import axios from "axios";
import moment from "moment";

const DormitoryManagementGrid = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [showTenantDialog, setShowTenantDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [editingRoom, setEditingRoom] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [expandedRooms, setExpandedRooms] = useState(new Set());
  const [expandedPayments, setExpandedPayments] = useState(new Set());
  const [roomData, setRoomData] = useState({
    _id: undefined,
    roomNumber: "",
    capacity: 0,
    occupied: 0,
    electricity: 0.0,
    water: 0.0,
    price: 0,
    aircon: false,
    wifi: false,
    bathroom: false,
    description: ""
  });
  const [formData, setFormData] = useState({
    _id: undefined,
    userId: undefined,
    firstName: '',
    lastName: '',
    contactNumber: '',
    email: '',
    rentAmount: '',
    startDate: '',
    endDate: '',
    paymentStatus: 'pending',
    roomId: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [tenantToMove, setTenantToMove] = useState(null);
  const [targetRoomId, setTargetRoomId] = useState("");
  const [genderFilter, setGenderFilter] = useState('all'); // <-- Add this
  const [newPayment, setNewPayment] = useState({ month: '', amount: '' });
  const [addingPayment, setAddingPayment] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/dorms');
      setRooms(response.data.dorms.sort((a, b) => a.roomNumber - b.roomNumber));
    } catch (error) {
      setError('Error fetching rooms');
    }
    setLoading(false);
  };

  const toggleRoomExpand = (roomId) => {
    setExpandedRooms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  };

  const togglePaymentExpand = (tenantId) => {
    setExpandedPayments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tenantId)) {
        newSet.delete(tenantId);
      } else {
        newSet.add(tenantId);
      }
      return newSet;
    });
  };

  const handleOpenTenantDialog = (roomId, tenant = null) => {
    const room = rooms.find(room => room._id === roomId);
    if (tenant) {
      setEditingTenant(tenant);
      setFormData({
        ...tenant,
        userId: tenant.id?.userId || tenant.userId,
        rentAmount: tenant.rentAmount.toString(),
        startDate: moment(tenant.startDate).format("YYYY-MM-DD"),
        endDate: moment(tenant.endDate).format("YYYY-MM-DD")
      });
    } else {
      setEditingTenant(null);
      const rentAmount = (room.price + room.electricity + room.water).toString();
      setFormData({
        _id: undefined,
        userId: undefined,
        firstName: '',
        lastName: '',
        contactNumber: '',
        email: '',
        rentAmount,
        startDate: '',
        endDate: '',
        paymentStatus: 'pending',
        roomId
      });
    }
    setShowTenantDialog(true);
  };

  const handleOpenRoomDialog = (room = undefined) => {
    if (room?._id) {
      setEditingRoom(true);
      setRoomData({
        _id: room._id,
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        occupied: room.occupied,
        electricity: room.electricity,
        water: room.water,
        price: room.price,
        aircon: room.amenities.aircon.toString(),
        wifi: room.amenities.wifi.toString(),
        bathroom: room.amenities.bathroom.toString(),
        description: room.description
      });
    } else {
      setRoomData({
        _id: undefined,
        roomNumber: "",
        capacity: 0,
        occupied: 0,
        electricity: 0.0,
        water: 0.0,
        price: 0,
        aircon: false,
        wifi: false,
        bathroom: false,
        description: ""
      });
    }
    setShowRoomDialog(true);
  };

  const handleOpenPaymentDialog = (tenant) => {
    const tenantId = tenant._id || (tenant.id && tenant.id._id);
    setSelectedTenant({ ...tenant, _id: tenantId, payments: tenant.payments || [] });
    setShowPaymentDialog(true);
  };

  const handleRoomChange = (field, value) => {
    setRoomData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoomSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingRoom) {
        await axios.post("http://localhost:8080/api/dorms/update", roomData, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });
        setEditingRoom(false);
      } else {
        await axios.post("http://localhost:8080/api/dorms/create", roomData, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });
      }
      setShowRoomDialog(false);
      setError('');
      fetchRooms();
    } catch (error) {
      setError('Failed to save room');
    }
  };

  const handleRoomDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this room?')) return;
    try {
      await axios.get(`http://localhost:8080/api/dorms/delete/${id}`);
      fetchRooms();
    } catch (error) {
      setError('Failed to delete room');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTenant) {
        await axios.post("http://localhost:8080/api/tenants/update", {
          formData
        }, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });
      } else {
        await axios.post("http://localhost:8080/api/tenants/create", {
          formData
        }, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });
      }
      setShowTenantDialog(false);
      fetchRooms();
    } catch (err) {
      setError('Failed to save tenant');
    }
  };

  const handleDeleteTenant = async (tenant) => {
    if (!window.confirm('Are you sure you want to remove this tenant?')) return;
    try {
      await axios.post("http://localhost:8080/api/tenants/delete", {
        tenant
      }, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      fetchRooms();
    } catch (error) {
      setError('Failed to delete tenant');
    }
  };

  const getOccupancyStatus = (room) => {
    const occupiedBeds = room.tenants.length;
    const availableBeds = room.capacity - occupiedBeds;
    return {
      status: availableBeds > 0 ? 'Available' : 'Full',
      color: availableBeds > 0 ? 'text-green-600' : 'text-red-600',
      available: availableBeds
    };
  };

// Enhanced getPaymentSummary function with null safety
const getPaymentSummary = (tenant) => {
  if (!tenant || !tenant.payments || !Array.isArray(tenant.payments)) {
    return { paid: 0, pending: 0, total: 0 };
  }
  
  const paid = tenant.payments.filter(p => p && p.status === 'paid').length;
  const total = tenant.payments.length;
  const pending = total - paid;
  return { paid, pending, total };
};


  const tenantsPerPage = 5;
  const totalPages = Math.ceil(rooms.length / tenantsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenMoveDialog = (tenant) => {
    const tenantId = tenant._id || (tenant.id && tenant.id._id);
    setTenantToMove({ ...tenant, _id: tenantId });
    setTargetRoomId("");
    setShowMoveDialog(true);
  };

  const handleMoveTenant = async () => {
    if (!tenantToMove || !tenantToMove._id || !targetRoomId) return;
    try {
      await axios.post("http://localhost:8080/api/tenants/move", {
        tenantId: tenantToMove._id,
        newRoomId: targetRoomId,
      });
      setShowMoveDialog(false);
      setTenantToMove(null);
      setTargetRoomId("");
      fetchRooms();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to move tenant");
    }
  };
// Updated handleTogglePaymentStatus function in AdminManageRooms.jsx
const handleTogglePaymentStatus = async (tenantId, month, currentStatus) => {
  if (!tenantId || !month) {
    setError('Missing tenant ID or month for payment update');
    return;
  }

  // Find the payment record in selectedTenant
  let payment = selectedTenant?.payments?.find(p => p.month === month);

  // If payment doesn't exist, create it first in the backend
  if (!payment) {
    try {
      const addRes = await axios.post('http://localhost:8080/api/tenants/add-payment', {
        tenantId,
        month,
        amount: selectedTenant.rentAmount,
        status: currentStatus === 'paid' ? 'pending' : 'paid',
        datePaid: currentStatus === 'paid' ? null : new Date(),
      });
      payment = addRes.data?.payment || {
        month,
        amount: selectedTenant.rentAmount,
        status: currentStatus === 'paid' ? 'pending' : 'paid',
        datePaid: currentStatus === 'paid' ? null : new Date(),
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add payment record');
      return;
    }
  } else {
    // Otherwise, update the payment status in the backend
    try {
      await axios.post('http://localhost:8080/api/tenants/update-payment', {
        tenantId,
        month,
        status: currentStatus === 'paid' ? 'pending' : 'paid',
        datePaid: currentStatus === 'paid' ? null : new Date(),
        amount: payment.amount || selectedTenant.rentAmount || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment status');
      return;
    }
  }

  // Refresh UI and selectedTenant from backend
  setError('');
  await fetchRooms();
  try {
    const { data } = await axios.get(`http://localhost:8080/api/tenants/get/${tenantId}`);
    if (data?.data?.tenant?.[0]) {
      setSelectedTenant({
        ...data.data.tenant[0],
        payments: data.data.tenant[0].payments || []
      });
    }
  } catch (err) {
    setError('Failed to refresh tenant data');
  }
};

// New function to add a payment record
const handleAddPayment = async () => {
  if (!selectedTenant || !newPayment.month || !newPayment.amount) {
    setError('Please fill in all payment details');
    return;
  }

  try {
    const response = await axios.post('http://localhost:8080/api/tenants/add-payment', {
      tenantId: selectedTenant._id,
      month: newPayment.month,
      amount: parseFloat(newPayment.amount),
      status: 'pending'
    });

    if (response.data) {
      // Reset form
      setNewPayment({ month: '', amount: '' });
      setAddingPayment(false);
      
      // Refresh data
      await fetchRooms();
      
      // Update selected tenant
      const { data } = await axios.get(`http://localhost:8080/api/tenants/get/${selectedTenant._id}`);
      if (data?.data?.tenant?.[0]) {
        setSelectedTenant({
          ...data.data.tenant[0],
          payments: data.data.tenant[0].payments || []
        });
      }
      
      setError('');
    }
  } catch (err) {
    console.error('Error adding payment:', err);
    setError(err.response?.data?.message || 'Failed to add payment record');
  }
};
 
 
  // Filter rooms based on genderFilter
  const filteredRooms = genderFilter === 'all'
    ? rooms
    : rooms.filter(room =>
        room.tenants.some(tenant => tenant.gender === genderFilter)
      );

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dormitory Management System</h1>
              <p className="text-gray-600">Manage rooms, tenants, and monthly payments efficiently</p>
            </div>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            onClick={handleOpenRoomDialog}
          >
            <Plus className="w-4 h-4" />
            Add Room
          </Button>
        </div>
        {/* Gender Filter Buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={genderFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setGenderFilter('all')}
          >
            All
          </Button>
          <Button
            variant={genderFilter === 'male' ? 'default' : 'outline'}
            onClick={() => setGenderFilter('male')}
          >
            Male
          </Button>
          <Button
            variant={genderFilter === 'female' ? 'default' : 'outline'}
            onClick={() => setGenderFilter('female')}
          >
            Female
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Rooms Grid */}
      <div className="space-y-6">
        {filteredRooms.slice((currentPage - 1) * tenantsPerPage, currentPage * tenantsPerPage).map(room => (
          <div key={room._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Room Header */}
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleRoomExpand(room._id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {expandedRooms.has(room._id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Room {room.roomNumber}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>Price: ₱{room.price?.toLocaleString()}</span>
                      <span>Electricity: ₱{room.electricity}/kWh</span>
                      <span>Water: ₱{room.water}/m³</span>
                      <span>Capacity: {room.capacity} beds</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    getOccupancyStatus(room).color === 'text-green-600'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getOccupancyStatus(room).available} beds available
                  </span>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    onClick={() => handleOpenRoomDialog(room)}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleOpenTenantDialog(room._id)}
                    disabled={room.tenants.length >= room.capacity}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Tenant
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    onClick={() => handleRoomDelete(room._id)}
                  >
                    <Minus className="w-4 h-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
            {/* Expanded Room Content */}
            {expandedRooms.has(room._id) && (
              <div className="p-6">
                {room.tenants.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No tenants in this room</p>
                  </div>
                ) :
                (
                  <div className="space-y-4">
                    {room.tenants.map(tenant => {
                      const paymentSummary = getPaymentSummary(tenant);
                      return (
                        <div key={tenant._id} className="border rounded-lg overflow-hidden">
                          {/* Tenant Header */}
                          <div className="bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => togglePaymentExpand(tenant._id)}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                  {expandedPayments.has(tenant._id) ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {tenant.firstName} {tenant.lastName}
                                  </h3>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>{tenant.email}</span>
                                    <span>{tenant.contactNumber}</span>
                                    <span>₱{tenant.rentAmount?.toLocaleString()}/month</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-sm">
                            
                                </div>
                  
<Button
  onClick={() => handleOpenPaymentDialog(tenant)}
  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
>
  Manage Payments
</Button>
 
                                <Button
                                  onClick={() => handleOpenTenantDialog(tenant.roomId, tenant)}
                                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  className="p-2 hover:bg-gray-200 rounded transition-colors text-red-600"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTenant(tenant)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenMoveDialog(tenant)}
                                  disabled={rooms.filter(r => r._id !== room._id && r.tenants.length < r.capacity).length === 0}
                                  title="Move Tenant"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          {/* Payment Status Grid */}
                          {expandedPayments.has(tenant._id) && (
                            <div className="p-4 bg-white">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {tenant.payments?.map((payment) => (
                                  <div
                                    key={payment.month}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                      payment.status === 'paid'
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-yellow-200 bg-yellow-50'
                                    }`}
                                    onClick={() => handleTogglePaymentStatus(tenant._id, payment.month, payment.status)}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-900">{payment.month}</span>
                                      {payment.status === 'paid' ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <Clock className="w-4 h-4 text-yellow-600" />
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      <div>₱{payment.amount?.toLocaleString()}</div>
                                      {payment.datePaid && (
                                        <div className="text-green-600 mt-1">Paid: {new Date(payment.datePaid).toLocaleDateString()}</div>
                                      )}
                                    </div>
                                    <div className={`text-xs font-medium mt-2 ${payment.status === 'paid' ? 'text-green-700' : 'text-yellow-700'}`}>
                                      {payment.status.toUpperCase()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, index) => (
          <Button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentPage === index + 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {index + 1}
          </Button>
        ))}
      </div>

      {/* Room Dialog */}
      <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? 'Edit Room' : 'Add Room'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRoomSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="room-number">Room Number</Label>
                <Input
                  id="room-number"
                  value={roomData.roomNumber}
                  onChange={(e) => handleRoomChange('roomNumber', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  value={roomData.capacity}
                  onChange={(e) => handleRoomChange('capacity', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={roomData.price}
                  onChange={(e) => handleRoomChange('price', e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-4 items-center">
                <div className="grid gap-2">
                  <Label htmlFor="electricity">Electricity (kw/H)</Label>
                  <Input
                    id="electricity"
                    type="number"
                    value={roomData.electricity}
                    onChange={(e) => handleRoomChange('electricity', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="water">
                    Water <span className="relative pr-1.5">(m
                      <span className="absolute top-0 right-0 text-xs -translate-y-1">3</span>
                    </span>)
                  </Label>
                  <Input
                    id="water"
                    type="number"
                    value={roomData.water}
                    onChange={(e) => handleRoomChange('water', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-center gap-x-2">
                <div className="text-left w-full grid gap-2">
                  <Label htmlFor="aircon">Aircon</Label>
                  <Select
                    value={roomData.aircon}
                    onValueChange={(value) => handleRoomChange('aircon', value)}
                    className="text-left"
                    required
                  >
                    <SelectTrigger id="aircon">
                      <SelectValue placeholder="Select Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full grid gap-2">
                  <Label htmlFor="wifi">WIFI</Label>
                  <Select
                    value={roomData.wifi}
                    onValueChange={(value) => handleRoomChange('wifi', value)}
                    required
                  >
                    <SelectTrigger id="wifi">
                      <SelectValue placeholder="Select Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full grid gap-2">
                  <Label htmlFor="bathroom">Bathroom</Label>
                  <Select
                    value={roomData.bathroom}
                    onValueChange={(value) => handleRoomChange('bathroom', value)}
                    required
                  >
                    <SelectTrigger id="bathroom">
                      <SelectValue placeholder="Select Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  value={roomData.description}
                  onChange={(e) => handleRoomChange('description', e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRoomDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingRoom ? 'Save Changes' : 'Add Room'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tenant Dialog */}
      <Dialog open={showTenantDialog} onOpenChange={setShowTenantDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              {editingTenant && (
                <div className="grid gap-2">
                  <Label htmlFor="userId">User Id</Label>
                  <Input
                    id="userId"
                    type="text"
                    value={formData.userId}
                    onChange={(e) => handleInputChange('userId', e.target.value)}
                  />
                </div>
              )}
              <div className="flex gap-x-2 items-center">
                <div className="flex-grow grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                <div className="flex-grow grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rent">Rent Amount</Label>
                <Input
                  id="rent"
                  type="text"
                  value={formData.rentAmount}
                  onChange={(e) => handleInputChange('rentAmount', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Payment Status</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) => handleInputChange('paymentStatus', value)}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowTenantDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingTenant ? 'Save Changes' : 'Add Tenant'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Move Tenant Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Move Tenant</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Select New Room</Label>
              <Select
                value={targetRoomId}
                onValueChange={setTargetRoomId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms
                    .filter(r => r._id !== (tenantToMove?.roomId || "") && r.tenants.length < r.capacity)
                    .map(r => (
                      <SelectItem key={r._id} value={r._id}>
                        Room {r.roomNumber} ({r.capacity - r.tenants.length} beds available)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleMoveTenant}
              disabled={!targetRoomId}
            >
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Management Dialog */}
      {showPaymentDialog && selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Payment Management - {selectedTenant.firstName} {selectedTenant.lastName}
                </h2>
                <button
                  onClick={() => setShowPaymentDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Place this inside your Manage Payments dialog rendering */}
            {showPaymentDialog && selectedTenant && (() => {
  // Generate all months between start and end date
  const months = generateMonthsForTenant(selectedTenant.startDate, selectedTenant.endDate);

  // Always use an array for payments
  const payments = Array.isArray(selectedTenant.payments) ? selectedTenant.payments : [];

  // Map months to payment records (merge with existing payments)
  const paymentsByMonth = months.map(month => {
    const payment = payments.find(p => p.month === month);
    return payment || {
      month,
      status: 'pending',
      datePaid: null,
      amount: selectedTenant.rentAmount,
    };
  });

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentsByMonth.map((payment) => (
          <div
            key={payment.month}
            className={`p-4 rounded-lg border-2 ${
              payment.status === 'paid'
                ? 'border-green-200 bg-green-50'
                : 'border-yellow-200 bg-yellow-50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">{payment.month}</h3>
              {payment.status === 'paid' ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Amount: ₱{payment.amount?.toLocaleString()}</div>
              {payment.datePaid && (
                <div>Paid: {new Date(payment.datePaid).toLocaleDateString()}</div>
              )}
            </div>
            <button
              onClick={() => handleTogglePaymentStatus(selectedTenant._id, payment.month, payment.status)}
              className={`w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                payment.status === 'paid'
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              Mark as {payment.status === 'paid' ? 'Pending' : 'Paid'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
})()}
          </div>
        </div>
      )}
    </div>
  );
};

export default DormitoryManagementGrid;

// Generate months between start and end date (inclusive)
function generateMonthsForTenant(startDate, endDate) {
  const months = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (current <= endMonth) {
    const monthName = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    months.push(monthName);
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

// Generate payment records between start and end date
function generatePayments(startDate, endDate, rentAmount) {
  const payments = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end) {
    const monthName = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    payments.push({
      month: monthName,
      status: 'pending',
      datePaid: null,
      amount: rentAmount
    });
    current.setMonth(current.getMonth() + 1);
  }

  return payments;
}