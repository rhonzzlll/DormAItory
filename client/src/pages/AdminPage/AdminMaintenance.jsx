import React, { useState } from 'react';
import { Card, CardContent } from '../../components/layouts/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/layouts/ui/tabs';
import Button from '../../components/layouts/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/layouts/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/layouts/ui/dialog';
import { Label } from '../../components/layouts/ui/label';
import { Textarea } from '../../components/layouts/ui/textarea';
import { Badge } from '../../components/layouts/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/layouts/ui/Select';
import { Input } from '../../components/layouts/ui/Input';

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '../../components/layouts/ui/alert-dialog';

// Dummy data
const DUMMY_REQUESTS = [
  {
    id: 1,
    fullName: 'John Doe',
    tenantId: 'T123',
    floorNo: '1',
    roomNo: '101',
    roomLetter: 'A',
    concernType: 'electrical',
    specificationOfConcern: 'Socket not working',
    status: 'pending',
    dateSubmitted: '2024-03-01',
    notes: []
  },
  {
    id: 2,
    fullName: 'Jane Smith',
    tenantId: 'T124',
    floorNo: '2',
    roomNo: '202',
    roomLetter: 'B',
    concernType: 'aircon',
    specificationOfConcern: 'AC not cooling properly',
    status: 'in-progress',
    dateSubmitted: '2024-03-02',
    notes: ['Technician scheduled for inspection']
  },
];

const INITIAL_CONCERN_TYPES = [
  { id: 1, name: 'Electrical', description: 'Involves Sockets, Wirings, etc.' },
  { id: 2, name: 'Aircon Maintenance', description: 'Involves Issue/Damages, Cleaning Request, etc.' },
  { id: 3, name: 'Room Maintenance', description: 'Involves Mattress Request, Bunk Maintenance, etc.' },
  { id: 4, name: 'Others', description: 'Please specify' }
];

function AdminMaintenance() {
  const [requests, setRequests] = useState(DUMMY_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [noteInput, setNoteInput] = useState('');
  const [concernTypes, setConcernTypes] = useState(INITIAL_CONCERN_TYPES);
  const [newConcern, setNewConcern] = useState({ name: '', description: '' });
  const [editingConcern, setEditingConcern] = useState(null);

  const filteredRequests = activeTab === 'all' 
    ? requests 
    : requests.filter(req => req.status === activeTab);

  const handleStatusChange = (requestId, newStatus) => {
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
  };

  const handleAddNote = (requestId) => {
    if (!noteInput.trim()) return;
    
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId 
          ? { ...req, notes: [...req.notes, noteInput] }
          : req
      )
    );
    setNoteInput('');
    setSelectedRequest(null);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return <Badge className={statusStyles[status]}>{status}</Badge>;
  };

  const handleAddConcern = () => {
    if (newConcern.name && newConcern.description) {
      setConcernTypes([...concernTypes, { id: Date.now(), ...newConcern }]);
      setNewConcern({ name: '', description: '' });
    }
  };

  const handleUpdateConcern = () => {
    if (editingConcern) {
      setConcernTypes(concernTypes.map(concern => 
        concern.id === editingConcern.id ? editingConcern : concern
      ));
      setEditingConcern(null);
    }
  };

  const handleDeleteConcern = (id) => {
    setConcernTypes(concernTypes.filter(concern => concern.id !== id));
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">All Requests</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                <TabsTrigger value="form-control">Form Control</TabsTrigger>
              </TabsList>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700">Export Data</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Maintenance Requests</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="mb-4">
                      <Label>Select Format</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="xls">XLSX</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Date Range</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">Export</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <TabsContent value={activeTab === 'form-control' ? 'form-control' : activeTab}>
              {activeTab === 'form-control' ? (
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="New concern type"
                      value={newConcern.name}
                      onChange={(e) => setNewConcern({ ...newConcern, name: e.target.value })}
                    />
                    <Input
                      placeholder="Description"
                      value={newConcern.description}
                      onChange={(e) => setNewConcern({ ...newConcern, description: e.target.value })}
                    />
                    <Button onClick={handleAddConcern}>Add</Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Concern Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {concernTypes.map((concern) => (
                        <TableRow key={concern.id}>
                          <TableCell>{concern.name}</TableCell>
                          <TableCell>{concern.description}</TableCell>
                          <TableCell>
                            <div className="space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">Edit</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Concern Type</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Name</Label>
                                      <Input
                                        value={editingConcern?.name || ''}
                                        onChange={(e) => setEditingConcern({ ...editingConcern, name: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <Label>Description</Label>
                                      <Textarea
                                        value={editingConcern?.description || ''}
                                        onChange={(e) => setEditingConcern({ ...editingConcern, description: e.target.value })}
                                      />
                                    </div>
                                    <Button onClick={handleUpdateConcern}>Update</Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action will delete the concern type.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteConcern(concern.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Room Info</TableHead>
                      <TableHead>Concern</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map(req => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div>{req.fullName}</div>
                          <div className="text-sm text-gray-500">{req.tenantId}</div>
                        </TableCell>
                        <TableCell>
                          Floor {req.floorNo}, Room {req.roomNo}{req.roomLetter}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{req.concernType}</div>
                          <div className="text-sm text-gray-500">{req.specificationOfConcern}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>{req.dateSubmitted}</TableCell>
                        <TableCell>
                          <div className="space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">View/Edit</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Maintenance Request Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Current Status</Label>
                                    <Select defaultValue={req.status} onValueChange={(value) => handleStatusChange(req.id, value)}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Add Note</Label>
                                    <Textarea 
                                      value={noteInput}
                                      onChange={(e) => setNoteInput(e.target.value)}
                                      placeholder="Add a note about this request"
                                    />
                                    <Button 
                                      onClick={() => handleAddNote(req.id)}
                                      className="mt-2"
                                    >
                                      Add Note
                                    </Button>
                                  </div>
                                  {req.notes.length > 0 && (
                                    <div>
                                      <Label>Notes History</Label>
                                      <div className="mt-2 space-y-2">
                                        {req.notes.map((note, index) => (
                                          <div key={index} className="p-2 bg-gray-100 rounded">
                                            {note}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">Cancel</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action will cancel the maintenance request. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>No, keep it</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleStatusChange(req.id, 'cancelled')}>
                                    Yes, cancel it
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminMaintenance;