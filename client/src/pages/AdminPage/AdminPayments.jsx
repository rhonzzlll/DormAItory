import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../components/layouts/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../components/layouts/ui/dialog';
import Button from '../../components/layouts/ui/Button';
import { Input } from '../../components/layouts/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../components/layouts/ui/table';
import {
  Edit,
  Trash2,
  Plus,
  Download
} from 'lucide-react';
import { toast } from '../../components/layouts/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/layouts/ui/Select';
import { saveAs } from 'file-saver';

const API_BASE_URL = 'http://localhost:8080/api';

const AdminPaymentManagement = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingMethod, setEditingMethod] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newMethod, setNewMethod] = useState({
    name: '',
    accountName: '',
    accountNumber: '',
    imageUrl: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchPayments();
    fetchPaymentRecords();
    fetchUsers();
  }, []);

  useEffect(() => {
    setFilteredRecords(
      paymentRecords.filter(record =>
        record.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, paymentRecords]);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments`);
      const data = await response.json();
      setPaymentMethods(data.filter(payment => payment.name));
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchPaymentRecords = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/records`);
      const data = await response.json();
      setPaymentRecords(data);
      setFilteredRecords(data);
    } catch (error) {
      console.error('Error fetching payment records:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setQrFile(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateMethod = async () => {
    if (editingMethod && editingMethod._id) {
      const updatedMethod = {
        ...editingMethod,
        imageUrl: qrFile || editingMethod.imageUrl
      };

      try {
        const response = await fetch(`${API_BASE_URL}/payments/${editingMethod._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedMethod)
        });

        if (response.ok) {
          const updatedMethodFromServer = await response.json();
          setPaymentMethods(paymentMethods.map(method =>
            method._id === editingMethod._id ? updatedMethodFromServer : method
          ));
          toast({
            title: "Payment Method Updated",
            description: `${editingMethod.name} details have been updated.`
          });
          setEditingMethod(null);
          setQrFile(null);
        } else {
          const errorText = await response.text();
          console.error('Error updating payment method:', response.statusText, errorText);
        }
      } catch (error) {
        console.error('Error updating payment method:', error);
      }
    } else {
      console.error('Editing method is invalid or missing id:', editingMethod);
    }
  };

  const handleCreateMethod = async () => {
    if (paymentMethods.length >= 2) {
      toast({
        title: "Limit Reached",
        description: "You can only add up to 2 payment methods."
      });
      return;
    }

    if (newMethod.name && newMethod.accountName && newMethod.accountNumber) {
      const newMethodObj = {
        ...newMethod,
        imageUrl: qrFile
      };

      try {
        const response = await fetch(`${API_BASE_URL}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newMethodObj)
        });

        if (response.ok) {
          const createdMethod = await response.json();
          setPaymentMethods([...paymentMethods, createdMethod]);
          toast({
            title: "Payment Method Created",
            description: `${newMethod.name} has been added.`
          });
          setNewMethod({
            name: '',
            accountName: '',
            accountNumber: '',
            imageUrl: ''
          });
          setQrFile(null);
          setIsCreateDialogOpen(false);
        } else {
          const errorText = await response.text();
          console.error('Error creating payment method:', response.statusText, errorText);
        }
      } catch (error) {
        console.error('Error creating payment method:', error);
      }
    }
  };

  const handleDeleteMethod = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setPaymentMethods(paymentMethods.filter(method => method._id !== id));
        toast({
          title: "Payment Method Deleted",
          description: "The payment method has been deleted."
        });
      } else {
        const errorText = await response.text();
        console.error('Error deleting payment method:', response.statusText, errorText);
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/records/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setPaymentRecords(paymentRecords.filter(record => record._id !== id));
        setFilteredRecords(filteredRecords.filter(record => record._id !== id));
        toast({
          title: "Payment Record Deleted",
          description: "The payment record has been deleted."
        });
      } else {
        const errorText = await response.text();
        console.error('Error deleting payment record:', response.statusText, errorText);
      }
    } catch (error) {
      console.error('Error deleting payment record:', error);
    }
  };

  const handleExportToCSV = () => {
    const csvContent = [
      ["Full Name", "Room No", "Amount", "Screenshot", "Reference Number", "Date"],
      ...filteredRecords.map(record => [
        record.fullName,
        record.roomNumber,
        record.amount,
        record.screenshotUrl,
        record.referenceNumber,
        record.date ? new Date(record.date).toLocaleDateString() : 'N/A'
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'payment_records.csv');
  };

  const renderPaymentMethodCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="mb-4" disabled={paymentMethods.length >= 2}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Method</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>QR Code</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentMethods.map((method) => (
              <TableRow key={method._id}>
                <TableCell>{method.name}</TableCell>
                <TableCell>{method.accountName}</TableCell>
                <TableCell>{method.accountNumber}</TableCell>
                <TableCell>
                  {method.imageUrl && (
                    <img
                      src={method.imageUrl}
                      alt="QR Code"
                      className="w-24 h-24 object-contain"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingMethod(method)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteMethod(method._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderPaymentRecordsTable = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Payment Records</CardTitle>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Button onClick={handleExportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Room No</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Screenshot</TableHead>
              <TableHead>Reference Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record._id}>
                <TableCell>{record.fullName}</TableCell>
                <TableCell>{record.roomNumber}</TableCell>
                <TableCell>₱{record.amount ? record.amount.toLocaleString() : 'N/A'}</TableCell>
                <TableCell>
                  {record.screenshotUrl && (
                    <img
                      src={`data:image/png;base64,${record.screenshotUrl}`}
                      alt="Screenshot"
                      className="w-24 h-24 object-contain cursor-pointer"
                      onClick={() => setPreviewImage(`data:image/png;base64,${record.screenshotUrl}`)}
                    />
                  )}
                </TableCell>
                <TableCell>{record.referenceNumber}</TableCell>
                <TableCell>{record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>
                  <Button variant="outline" size="icon" onClick={() => handleDeleteRecord(record._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderEditMethodDialog = () => (
    <Dialog
      open={!!editingMethod}
      onOpenChange={() => setEditingMethod(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {editingMethod?.name} Payment Method</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Account Name"
            value={editingMethod?.accountName || ''}
            onChange={(e) => setEditingMethod({
              ...editingMethod,
              accountName: e.target.value
            })}
          />
          <Input
            placeholder="Account Number"
            value={editingMethod?.accountNumber || ''}
            onChange={(e) => setEditingMethod({
              ...editingMethod,
              accountNumber: e.target.value
            })}
          />
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {(qrFile || editingMethod?.imageUrl) && (
              <img
                src={qrFile || editingMethod.imageUrl}
                alt="QR Code"
                className="w-24 h-24 object-contain"
              />
            )}
          </div>
          <Button onClick={handleUpdateMethod} className="w-full">
            Update Payment Method
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderCreateMethodDialog = () => (
    <Dialog
      open={isCreateDialogOpen}
      onOpenChange={() => setIsCreateDialogOpen(false)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Payment Method</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select
            value={newMethod.name}
            onValueChange={(value) => setNewMethod({ ...newMethod, name: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GCASH">GCASH</SelectItem>
              <SelectItem value="Paymaya">Paymaya</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Account Name"
            value={newMethod.accountName}
            onChange={(e) => setNewMethod({ ...newMethod, accountName: e.target.value })}
          />
          <Input
            placeholder="Account Number"
            value={newMethod.accountNumber}
            onChange={(e) => setNewMethod({ ...newMethod, accountNumber: e.target.value })}
          />
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {qrFile && (
              <img
                src={qrFile}
                alt="QR Code"
                className="w-24 h-24 object-contain"
              />
            )}
          </div>
          <Button onClick={handleCreateMethod} className="w-full">
            Create Payment Method
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderImagePreviewDialog = () => (
    <Dialog
      open={!!previewImage}
      onOpenChange={() => setPreviewImage(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Image Preview</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Payment Management</h1>
      {renderPaymentMethodCard()}
      {renderPaymentRecordsTable()}
      {renderEditMethodDialog()}
      {renderCreateMethodDialog()}
      {renderImagePreviewDialog()}
    </div>
  );
};

export default AdminPaymentManagement;