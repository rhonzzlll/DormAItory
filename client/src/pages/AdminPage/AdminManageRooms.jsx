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
  Pencil
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
import  Button  from '../../components/layouts/ui/Button';
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
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);
  const [expandedRooms, setExpandedRooms] = useState(new Set());
  const [roomData, setRoomData] = useState({
    roomNumber: "",
    capacity: 0,
    occupied: 0,
    price: 0,
    aircon: false,
    wifi: false,
    bathroom: false,
    description: ""
  });
  const [formData, setFormData] = useState({
    _id: undefined,
    userId: undefined,
    name: '',
    contactNumber: '',
    email: '',
    rentAmount: '',
    startDate: '',
    endDate: '',
    paymentStatus: 'PENDING',
    roomId: null
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/dorms');
      setRooms(response.data.dorms);
    } catch (error) {
      console.error('Error fetching all dorms:', error);
    }
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

  const handleOpenTenantDialog = (roomId, tenant = null) => {
    if (tenant) {
      setEditingTenant(tenant);
      setFormData({
        ...tenant,
        rentAmount: tenant.rentAmount.toString(),
        startDate: moment(tenant.startDate).format("YYYY-MM-DD"),
        endDate: moment(tenant.endDate).format("YYYY-MM-DD")
      });
    } else {
      setEditingTenant(null);
      setFormData({
        _id: undefined,
        userId: undefined,
        firstName: '',
        lastName: '',
        rentAmount: 0,
        startDate: '',
        endDate: '',
        paymentStatus: 'pending',
        roomId
      });
    }
    setShowTenantDialog(true);
  };

  const handleOpenRoomDialog = (id = undefined) => {
    setEditingRoom(null);

    setRoomData({
      firstName: "",
      lastName: "",
      capacity: 0,
      price: 0,
      aircon: "false",
      wifi: "false",
      bathroom: "false",
      description: ''
    });

    setShowRoomDialog(true);
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
      await axios.post("http://localhost:8080/api/dorms/create", roomData, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      setShowRoomDialog(false);
      setError('');
      fetchRooms();
    } catch (error) {
      setError('Failed to add new room');
    }
  }

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
        const tenant = await axios.post("http://localhost:8080/api/tenants/create", {
          formData
        }, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });

        if (tenant) {
          setError('');
        }
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
      setError('');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="w-6 h-6" />
            <div>
              <CardTitle>Dormitory Management System</CardTitle>
              <CardDescription>Manage rooms and tenants efficiently</CardDescription>
            </div>
            <Button
            className="ml-auto flex items-center gap-2"
            onClick={handleOpenRoomDialog}
          >
            <Plus className="w-4 h-4" />
            Add Room
          </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {rooms.map(room => (
              <Card key={room._id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRoomExpand(room._id)}
                        className="p-1"
                      >
                        {expandedRooms.has(room._id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="text-lg font-semibold">Room {room.roomNumber}</h3>
                        <p className="text-sm text-gray-600">
                          Base Price: ₱{room.price.toLocaleString()} | 
                          Capacity: {room.capacity} beds
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        getOccupancyStatus(room).color === 'text-green-600' 
                          ? 'bg-green-100' 
                          : 'bg-red-100'
                      }`}>
                        {getOccupancyStatus(room).available} beds available
                      </span>
                      <Button
                        className="flex items-center gap-2 bg-red-500"
                      >
                        <Minus className="w-4 h-4" />
                        Remove
                      </Button>
                      <Button
                        className="flex items-center gap-2 bg-green-500"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleOpenTenantDialog(room._id)}
                        disabled={room.tenants.length >= room.capacity}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Tenant
                      </Button>
                    </div>
                  </div>

                  {expandedRooms.has(room._id) && (
                    <div className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Rent Amount</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Payment Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {room.tenants && room.tenants.map(tenant => (
                            <TableRow key={tenant._id}>
                              <TableCell className="font-medium">{tenant.firstName} {tenant.lastName}</TableCell>
                              <TableCell>{tenant.contactNumber}</TableCell>
                              <TableCell>{tenant.email}</TableCell>
                              <TableCell className="text-right">₱{tenant.rentAmount.toLocaleString()}</TableCell>
                              <TableCell>{new Date(tenant.startDate).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(tenant.endDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-sm ${
                                  tenant.paymentStatus === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {tenant.paymentStatus.charAt(0).toUpperCase() + tenant.paymentStatus.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenTenantDialog(tenant.roomId, tenant)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteTenant(tenant)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

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
                  // required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  value={roomData.capacity}
                  onChange={(e) => handleRoomChange('capacity', e.target.value)}
                  // required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="price"
                  value={roomData.price}
                  onChange={(e) => handleRoomChange('price', e.target.value)}
                  // required
                />
              </div>
              <div className="flex items-center justify-center gap-x-2">
                <div className="text-left w-full grid gap-2">
                  <Label htmlFor="aircon">Aircon</Label>
                  <Select
                    value={roomData.aircon}
                    onValueChange={(value) => handleRoomChange('aircon', value)}
                    className="text-left "
                    // required
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
                    // required
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
                    // required
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
                  type="description"
                  value={roomData.description}
                  onChange={(e) => handleRoomChange('description', e.target.value)}
                  // required
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
      <Dialog open={showTenantDialog} onOpenChange={setShowTenantDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="flex gap-x-2 items-center">
                <div className="flex-grow grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="flex-grow grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
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
    </div>
  );
};

export default DormitoryManagementGrid;