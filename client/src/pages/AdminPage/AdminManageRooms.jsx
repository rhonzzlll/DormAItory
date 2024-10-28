import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Building,
  RefreshCw
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

// Mock initial data
const initialRooms = [
  {
    id: 1,
    roomNumber: "101",
    price: 5000,
    capacity: 4,
    tenants: [
      {
        id: 1,
        name: "John Doe",
        contactNumber: "123-456-7890",
        email: "john@example.com",
        rentAmount: 5000,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        paymentStatus: "PAID"
      }
    ]
  },
  {
    id: 2,
    roomNumber: "102",
    price: 4500,
    capacity: 2,
    tenants: []
  }
];

const DormitoryManagementGrid = () => {
  const [rooms, setRooms] = useState(initialRooms);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTenantDialog, setShowTenantDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);
  const [expandedRooms, setExpandedRooms] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    rentAmount: '',
    startDate: '',
    endDate: '',
    paymentStatus: 'PENDING',
    roomId: null
  });

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

  const handleOpenTenantDialog = (room, tenant = null) => {
    setSelectedRoom(room);
    if (tenant) {
      setEditingTenant(tenant);
      setFormData({
        ...tenant,
        rentAmount: tenant.rentAmount.toString()
      });
    } else {
      setEditingTenant(null);
      setFormData({
        name: '',
        contactNumber: '',
        email: '',
        rentAmount: '',
        startDate: '',
        endDate: '',
        paymentStatus: 'PENDING',
        roomId: room.id
      });
    }
    setShowTenantDialog(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newTenant = {
        ...formData,
        id: editingTenant ? editingTenant.id : Date.now(), // Generate temporary ID
        rentAmount: parseFloat(formData.rentAmount)
      };

      setRooms(prevRooms => {
        return prevRooms.map(room => {
          if (room.id === selectedRoom.id) {
            const updatedTenants = editingTenant
              ? room.tenants.map(t => t.id === editingTenant.id ? newTenant : t)
              : [...room.tenants, newTenant];
            return { ...room, tenants: updatedTenants };
          }
          return room;
        });
      });

      setShowTenantDialog(false);
      setError('');
    } catch (err) {
      setError('Failed to save tenant');
    }
  };

  const handleDeleteTenant = (roomId, tenantId) => {
    if (!window.confirm('Are you sure you want to remove this tenant?')) return;

    try {
      setRooms(prevRooms => {
        return prevRooms.map(room => {
          if (room.id === roomId) {
            return {
              ...room,
              tenants: room.tenants.filter(t => t.id !== tenantId)
            };
          }
          return room;
        });
      });
      setError('');
    } catch (err) {
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
              <Card key={room.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRoomExpand(room.id)}
                        className="p-1"
                      >
                        {expandedRooms.has(room.id) ? (
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
                        onClick={() => handleOpenTenantDialog(room)}
                        disabled={room.tenants.length >= room.capacity}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Tenant
                      </Button>
                    </div>
                  </div>

                  {expandedRooms.has(room.id) && (
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
                          {room.tenants.map(tenant => (
                            <TableRow key={tenant.id}>
                              <TableCell className="font-medium">{tenant.name}</TableCell>
                              <TableCell>{tenant.contactNumber}</TableCell>
                              <TableCell>{tenant.email}</TableCell>
                              <TableCell className="text-right">₱{tenant.rentAmount.toLocaleString()}</TableCell>
                              <TableCell>{new Date(tenant.startDate).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(tenant.endDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-sm ${
                                  tenant.paymentStatus === 'PAID'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {tenant.paymentStatus}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenTenantDialog(room, tenant)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteTenant(room.id, tenant.id)}
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

      <Dialog open={showTenantDialog} onOpenChange={setShowTenantDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rent">Rent Amount</Label>
                <Input
                  id="rent"
                  type="number"
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
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
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