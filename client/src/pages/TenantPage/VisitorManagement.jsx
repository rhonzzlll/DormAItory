import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/layouts/ui/Card';
import { Label } from '../../components/layouts/ui/label';
import { Input } from '../../components/layouts/ui/Input';
import Button from '../../components/layouts/ui/Button';
import { Textarea } from '../../components/layouts/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/layouts/ui/Select';
import { Checkbox } from '../../components/layouts/ui/checkbox';
import Calendar from '../../components/layouts/ui/calendar';
import Popover, { PopoverContent, PopoverTrigger } from '../../components/layouts/ui/popover';
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";

const VisitorRegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    relationship: '',
    tenantId: '',
    tenantName: '',
    visitDate: null,
    arrivalTime: '',
    departureTime: '',
    purpose: '',
    items: '',
    specialInstructions: '',
    agreeToPolicy: false
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateSelect = (date) => {
    setFormData(prev => ({
      ...prev,
      visitDate: date
    }));
  };

  const handleRelationshipChange = (value) => {
    setFormData(prev => ({
      ...prev,
      relationship: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.visitDate) {
      newErrors.visitDate = 'Visit date is required';
    }

    if (!formData.arrivalTime) {
      newErrors.arrivalTime = 'Arrival time is required';
    }

    if (!formData.agreeToPolicy) {
      newErrors.agreeToPolicy = 'You must agree to dormitory policies';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    // Add API call here
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Visitor Registration Form</CardTitle>
          <CardDescription>Please fill out all required fields to register your visit to MLQU Dormitory</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Visitor Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Visitor Details</h3>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && <span className="text-sm text-red-500">{errors.fullName}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                />
                {errors.phoneNumber && <span className="text-sm text-red-500">{errors.phoneNumber}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
              </div>

              <div className="space-y-2">
                <Label>Relationship to Tenant *</Label>
                <Select onValueChange={handleRelationshipChange} value={formData.relationship}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="colleague">Colleague</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tenant Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tenant Information</h3>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenantId">Tenant ID</Label>
                <Input
                  id="tenantId"
                  name="tenantId"
                  value={formData.tenantId}
                  onChange={handleInputChange}
                  placeholder="Enter tenant ID if known"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantName">Tenant Full Name</Label>
                <Input
                  id="tenantName"
                  name="tenantName"
                  value={formData.tenantName}
                  onChange={handleInputChange}
                  readOnly={formData.tenantId}
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Visit Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Visit Details</h3>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Date of Visit *</Label>
                <Popover>
                  <PopoverTrigger>
                    <button
                      type="button"
                      className={`
                        w-full px-3 py-2 text-left text-sm
                        border rounded-md bg-white hover:bg-gray-50
                        flex items-center
                        ${!formData.visitDate ? 'text-gray-500' : 'text-gray-900'}
                      `}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formData.visitDate ? format(formData.visitDate, "PPP") : "Select date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      selected={formData.visitDate}
                      onSelect={handleDateSelect}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrivalTime">Arrival Time *</Label>
                <Input
                  id="arrivalTime"
                  name="arrivalTime"
                  type="time"
                  value={formData.arrivalTime}
                  onChange={handleInputChange}
                  className={errors.arrivalTime ? 'border-red-500' : ''}
                />
                {errors.arrivalTime && <span className="text-sm text-red-500">{errors.arrivalTime}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input
                  id="departureTime"
                  name="departureTime"
                  type="time"
                  value={formData.departureTime}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Visit</Label>
                <Textarea
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="Please describe the purpose of your visit"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="items">Items Carried</Label>
                <Textarea
                  id="items"
                  name="items"
                  value={formData.items}
                  onChange={handleInputChange}
                  placeholder="List any items you are bringing with you"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  placeholder="Any special instructions or requirements"
                />
              </div>
            </div>
          </div>

          {/* Approval & Acknowledgment Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
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
              />
              <Label htmlFor="agreeToPolicy" className="text-sm">
                I agree to follow all dormitory policies and guidelines during my visit *
              </Label>
            </div>
            {errors.agreeToPolicy && <span className="text-sm text-red-500">{errors.agreeToPolicy}</span>}
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full">
            Confirm Visit
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default VisitorRegistrationForm;