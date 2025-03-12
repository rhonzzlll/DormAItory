import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/layouts/ui/Card';
import { Label } from '../../components/layouts/ui/label';
import { Input } from '../../components/layouts/ui/Input';
import Button from '../../components/layouts/ui/Button';
import { Textarea } from '../../components/layouts/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/layouts/ui/Select';
import { Checkbox } from '../../components/layouts/ui/checkbox';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const API_BASE_URL = 'http://dormaitory.online:8080/api';

const VisitorRegistrationForm = () => {
  const [visitors, setVisitors] = useState([{ fullName: '', phoneNumber: '', email: '', relationship: '' }]);
  const [formData, setFormData] = useState({
    tenantId: '',
    visitDate: null,
    arrivalTime: '',
    departureTime: '',
    purpose: '',
    items: '',
    specialInstructions: '',
    agreeToPolicy: false
  });
  const [errors, setErrors] = useState({});
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [roomAssigned, setRoomAssigned] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchTenantData();
  }, []);

  const fetchTenantData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tenants/get/${localStorage.getItem("_id")}`);
      const { tenant } = response.data.data;

      if (tenant && tenant.length > 0) {
        setFormData(prevFormData => ({
          ...prevFormData,
          tenantId: tenant[0]["_id"]
        }));
        if (!tenant[0].user[0].roomNumber) {
          setRoomAssigned(false);
          setOpenDialog(true);
        }
      } else {
        setRoomAssigned(false);
        setOpenDialog(true);
      }
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      setRoomAssigned(false);
      setOpenDialog(true);
    }
  };

  const handleVisitorChange = (index, event) => {
    const { name, value } = event.target;
    const newVisitors = [...visitors];
    newVisitors[index][name] = value;
    setVisitors(newVisitors);
  };

  const handleRelationshipChange = (index, value) => {
    const newVisitors = [...visitors];
    newVisitors[index].relationship = value;
    setVisitors(newVisitors);
  };

  const addVisitor = () => {
    setVisitors([...visitors, { fullName: '', phoneNumber: '', email: '', relationship: '' }]);
  };

  const removeVisitor = (index) => {
    const newVisitors = visitors.filter((_, i) => i !== index);
    setVisitors(newVisitors);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, visitDate: date });
  };

  const validateForm = () => {
    const newErrors = {};

    visitors.forEach((visitor, index) => {
      if (!visitor.fullName) {
        newErrors[`visitors[${index}].fullName`] = 'Full name is required';
      }
      if (!visitor.phoneNumber) {
        newErrors[`visitors[${index}].phoneNumber`] = 'Phone number is required';
      }
      if (!visitor.relationship) {
        newErrors[`visitors[${index}].relationship`] = 'Relationship is required';
      }
    });

    if (!formData.arrivalTime) newErrors.arrivalTime = 'Arrival time is required';
    if (!formData.agreeToPolicy) newErrors.agreeToPolicy = 'You must agree to the policies';

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await axios.post('http://dormaitory.online:8080/api/visitors/register', { visitors, ...formData });
      setConfirmationMessage('Your visit has been successfully registered.');
      setErrors({});
      window.location.reload(); // Refresh the page
    } catch (error) {
      setConfirmationMessage('');
      setErrors({ submit: 'Failed to register visit. Please try again.' });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (!roomAssigned) {
    return (
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Visitor Registration"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You cannot request visitors without room assignment. Please contact the administration for room assignment.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="space-y-2 bg-blue-50 rounded-t-lg">
          <CardTitle className="text-2xl text-black">Visitor Registration Form</CardTitle>
          <CardDescription className="text-lg text-black">
            Please fill out all required fields to register your visit to MLQU Dormitory
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 p-6">
          {/* Tenant ID Section */}
          <div className="space-y-2">
            <Label htmlFor="tenantId" className="text-lg text-black">Tenant ID *</Label>
            <Input
              id="tenantId"
              name="tenantId"
              value={formData.tenantId}
              onChange={handleInputChange}
              className={`h-12 text-lg text-black ${errors.tenantId ? 'border-red-500' : ''}`}
              readOnly
            />
            {errors.tenantId &&
              <span className="text-sm text-red-500">{errors.tenantId}</span>
            }
          </div>

          {/* Visitor Details Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-black border-b pb-2">Visitor Details</h3>

            {visitors.map((visitor, index) => (
              <div key={index} className="grid gap-4 border p-6 rounded-lg bg-gray-50 shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor={`fullName-${index}`} className="text-lg text-black">
                    Full Name *
                  </Label>
                  <Input
                    id={`fullName-${index}`}
                    name="fullName"
                    value={visitor.fullName}
                    onChange={(e) => handleVisitorChange(index, e)}
                    className={`h-12 text-lg text-black ${errors[`visitors[${index}].fullName`] ? 'border-red-500' : ''}`}
                  />
                  {errors[`visitors[${index}].fullName`] &&
                    <span className="text-sm text-red-500">{errors[`visitors[${index}].fullName`]}</span>
                  }
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`phoneNumber-${index}`} className="text-lg text-black">
                      Phone Number *
                    </Label>
                    <Input
                      id={`phoneNumber-${index}`}
                      name="phoneNumber"
                      type="tel"
                      value={visitor.phoneNumber}
                      onChange={(e) => handleVisitorChange(index, e)}
                      className={`h-12 text-lg text-black ${errors[`visitors[${index}].phoneNumber`] ? 'border-red-500' : ''}`}
                    />
                    {errors[`visitors[${index}].phoneNumber`] &&
                      <span className="text-sm text-red-500">{errors[`visitors[${index}].phoneNumber`]}</span>
                    }
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`email-${index}`} className="text-lg text-black">
                      Email Address
                    </Label>
                    <Input
                      id={`email-${index}`}
                      name="email"
                      type="email"
                      value={visitor.email}
                      onChange={(e) => handleVisitorChange(index, e)}
                      className="h-12 text-lg text-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-lg text-black">Relationship to Tenant *</Label>
                  <Select
                    onValueChange={(value) => handleRelationshipChange(index, value)}
                    value={visitor.relationship}
                  >
                    <SelectTrigger className={`h-12 text-lg text-black ${errors[`visitors[${index}].relationship`] ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="colleague">Colleague</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors[`visitors[${index}].relationship`] &&
                    <span className="text-sm text-red-500">{errors[`visitors[${index}].relationship`]}</span>
                  }
                </div>

                {visitors.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeVisitor(index)}
                    variant="destructive"
                    className="h-12 text-lg"
                  >
                    Remove Visitor
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              onClick={addVisitor}
              variant="secondary"
              className="h-12 text-lg w-full md:w-auto"
            >
              Add Another Visitor
            </Button>
          </div>
        </CardContent>

        <CardContent className="space-y-6">
          <h3 className="text-xl font-semibold text-black border-b pb-2">Visit Details</h3>
          <div className="space-y-2">
            <Label>Date of Visit</Label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select date"
                value={formData.visitDate}
                onChange={handleDateChange}
                renderInput={(params) => <Input {...params} />}
              />
            </LocalizationProvider>
          </div>
        </CardContent>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arrivalTime" className="text-lg text-black">Arrival Time *</Label>
              <Input
                id="arrivalTime"
                name="arrivalTime"
                type="time"
                value={formData.arrivalTime}
                onChange={handleInputChange}
                className={`h-12 text-lg text-black ${errors.arrivalTime ? 'border-red-500' : ''}`}
              />
              {errors.arrivalTime &&
                <span className="text-sm text-red-500">{errors.arrivalTime}</span>
              }
            </div>

            <div className="space-y-2">
              <Label htmlFor="departureTime" className="text-lg text-black">Departure Time</Label>
              <Input
                id="departureTime"
                name="departureTime"
                type="time"
                value={formData.departureTime}
                onChange={handleInputChange}
                className="h-12 text-lg text-black"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-lg text-black">Purpose of Visit</Label>
            <Textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="Please describe the purpose of your visit"
              className="min-h-[100px] text-lg text-black"
            />
          </div>
        </CardContent>

        {/* Additional Information Section */}
        <CardContent className="space-y-6">
          <h3 className="text-xl font-semibold text-black border-b pb-2">Additional Information</h3>

          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="items" className="text-lg text-black">Items Carried</Label>
              <Textarea
                id="items"
                name="items"
                value={formData.items}
                onChange={handleInputChange}
                placeholder="List any items you are bringing with you"
                className="min-h-[100px] text-lg text-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions" className="text-lg text-black">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                placeholder="Any special instructions or requirements"
                className="min-h-[100px] text-lg text-black"
              />
            </div>
          </div>
        </CardContent>

        {/* Approval & Acknowledgment Section */}
        <CardContent className="space-y-4 bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="agreeToPolicy"
              checked={formData.agreeToPolicy}
              onCheckedChange={(checked) => {
                setFormData(prev => ({
                  ...prev,
                  agreeToPolicy: checked
                }));
                if (errors.agreeToPolicy) {
                  setErrors(prev => ({
                    ...prev,
                    agreeToPolicy: ''
                  }));
                }
              }}
              className="h-6 w-6"
            />
            <Label htmlFor="agreeToPolicy" className="text-lg text-black">
              I agree to follow all dormitory policies and guidelines during my visit *
            </Label>
          </div>
          {errors.agreeToPolicy &&
            <span className="text-sm text-red-500 block mt-2">{errors.agreeToPolicy}</span>
          }
        </CardContent>

        <CardFooter className="px-6 pb-6">
          <Button
            type="submit"
            className="w-full h-14 text-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            Confirm Visit
          </Button>
        </CardFooter>
      </Card>

      {confirmationMessage && (
        <div className="mt-6 p-6 bg-green-100 text-green-700 rounded-lg text-lg text-center">
          {confirmationMessage}
        </div>
      )}

      {errors.submit && (
        <div className="mt-6 p-6 bg-red-100 text-red-700 rounded-lg text-lg text-center">
          {errors.submit}
        </div>
      )}
    </form>
  );
};

export default VisitorRegistrationForm;