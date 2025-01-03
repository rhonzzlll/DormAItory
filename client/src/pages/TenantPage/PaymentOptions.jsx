import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, Check, Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../../components/layouts/ui/alert';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const PaymentSystem = ({ isAdmin = false, adminQrCodes = {}, refreshPaymentRecords }) => {
  const userId = localStorage.getItem("_id"); // Retrieve userId from localStorage
  const [currentUser, setCurrentUser] = useState(null);
  const [currentStep, setCurrentStep] = useState('options');
  const [selectedOption, setSelectedOption] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [submissionError, setSubmissionError] = useState(null);

  useEffect(() => {
    fetchPaymentMethods();
    fetchPaymentRecords();
    fetchUserData();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments`);
      const data = await response.json();
      setPaymentMethods(data.filter(payment => payment.name));
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const fetchPaymentRecords = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments`);
      const data = await response.json();
      setPaymentRecords(data);
    } catch (error) {
      console.error('Error fetching payment records:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      console.log(`Fetching user data for userId: ${userId}`);
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
      const userData = response.data;
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handlePaymentSubmission = async (details) => {
    try {
      setSubmissionError(null);

      if (!details.amount || !details.referenceNumber || !details.screenshotUrl) {
        throw new Error('Please fill in all required fields');
      }

      if (!currentUser || !currentUser.firstName || !currentUser.lastName || !currentUser.roomNo) {
        throw new Error('User information is missing');
      }

      const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
      const formData = {
        amount: details.amount,
        referenceNumber: details.referenceNumber,
        screenshotUrl: details.screenshotUrl,
        paymentMethod: selectedOption,
        fullName: fullName,
        roomNumber: currentUser.roomNo,
      };

      console.log('Form data before submission:', formData);

      const response = await axios.post(`${API_BASE_URL}/payments/records`, formData);

      if (response.status !== 201) {
        throw new Error(response.data || 'Payment submission failed');
      }

      const result = response.data;
      console.log('Payment submission successful:', result);

      setPaymentDetails(result);
      setCurrentStep('confirmation');

      if (refreshPaymentRecords) {
        refreshPaymentRecords(); // Call the callback to refresh payment records
      }

    } catch (error) {
      console.error('Error submitting payment:', error);
      setSubmissionError(error.message || 'An unexpected error occurred');
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'options':
        return (
          <PaymentOptions
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            setCurrentStep={setCurrentStep}
            paymentMethods={paymentMethods}
          />
        );
      case 'paymentForm':
        return (
          <PaymentForm
            paymentMethod={paymentMethods.find(method => method._id === selectedOption)}
            setCurrentStep={setCurrentStep}
            handlePaymentSubmission={handlePaymentSubmission}
            submissionError={submissionError}
            currentUser={currentUser}
          />
        );
      case 'confirmation':
        return (
          <PaymentConfirmation
            paymentDetails={paymentDetails}
            setCurrentStep={setCurrentStep}
          />
        );
      default:
        return <PaymentOptions paymentMethods={paymentMethods} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {renderContent()}
    </div>
  );
};

const PaymentOptions = ({
  selectedOption,
  setSelectedOption,
  setCurrentStep,
  paymentMethods
}) => {
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption) {
      setCurrentStep('paymentForm');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Available Payment Options</h2>
        <p className="text-gray-600">You may visit the admin office for billing inquiries</p>
      </div>

      <Alert variant="info" className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          Please ensure to upload a clear screenshot of your payment for faster verification.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        {paymentMethods.map((method) => (
          <PaymentOption
            key={method._id}
            {...method}
            selected={selectedOption === method._id}
            onClick={() => handleOptionSelect(method._id)}
          />
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </span>
        </button>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedOption}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const PaymentOption = ({ _id, name, subtitle, color, selected, onClick, accountNumber, accountName, imageUrl }) => {
  return (
    <div
      className={`relative p-6 rounded-xl transition-all cursor-pointer border-2 hover:shadow-md ${selected ? 'border-blue-500 shadow-md' : 'border-gray-200'
        }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div
          className="p-3 rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <CreditCard className="w-6 h-6" style={{ color: color }} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-gray-600 text-sm">{subtitle}</p>
          <div className="mt-3 text-sm">
            <p><strong>Account Number:</strong> {accountNumber}</p>
            <p><strong>Account Name:</strong> {accountName}</p>
          </div>
          {imageUrl && (
            <div className="mt-3">
              <img src={imageUrl} alt={`${name} QR Code`} className="w-24 h-24 object-contain" />
            </div>
          )}
        </div>
        {selected && (
          <div className="absolute top-4 right-4">
            <Check className="w-5 h-5 text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentForm = ({ paymentMethod, setCurrentStep, handlePaymentSubmission, submissionError, currentUser }) => {
  const [formData, setFormData] = useState({
    amount: '',
    referenceNumber: '',
    screenshotUrl: ''
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1]; // Get the base64 string
      setFormData(prev => ({ ...prev, screenshotUrl: base64String })); // Save the base64 string
      setPreviewUrl(reader.result); // Set the preview URL
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.referenceNumber || !formData.screenshotUrl) {
      setError('Please fill in all required fields');
      return;
    }
    console.log('Form data before submission:', formData);
    handlePaymentSubmission(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{paymentMethod.name} Payment</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-4">Payment Details</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Account Number:</strong> {paymentMethod.accountNumber}</p>
            <p><strong>Account Name:</strong> {paymentMethod.accountName}</p>
            {paymentMethod.imageUrl && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Scan QR Code to Pay</p>
                <img src={paymentMethod.imageUrl} alt="Payment QR Code" className="w-48 h-48 object-contain" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount (PHP)</label>
            <input
              type="text"
              value={formData.amount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setFormData(prev => ({ ...prev, amount: value }));
              }}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Enter amount"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reference Number</label>
            <input
              type="text"
              value={formData.referenceNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Enter reference number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payment Screenshot</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative">
              {previewUrl ? (
                <div className="space-y-4">
                  <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto" />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl('');
                      setFormData(prev => ({ ...prev, screenshotUrl: '' }));
                    }}
                    className="text-red-500 text-sm hover:text-red-600"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  <div className="text-sm text-gray-600">
                    Click to upload or drag and drop
                    <br />
                    PNG, JPG up to 5MB
                  </div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {submissionError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Submission Error</AlertTitle>
            <AlertDescription>{submissionError}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => setCurrentStep('options')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </span>
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Payment
          </button>
        </div>
      </form>
    </div>
  );
};

const PaymentConfirmation = ({ paymentDetails, setCurrentStep }) => {
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>

        <h2 className="text-2xl font-bold mb-2">Payment Submitted!</h2>
        <div className="space-y-2 mb-6">
          <p className="text-gray-600">
            Your payment of PHP {paymentDetails?.amount || 'N/A'} has been submitted for processing.
          </p>
          <p className="text-gray-600">
            Reference Number: {paymentDetails?.referenceNumber || 'N/A'}
          </p>
          <p className="text-gray-600">
            Full Name: {paymentDetails?.fullName || 'N/A'}
          </p>
          <p className="text-gray-600">
            Room Number: {paymentDetails?.roomNumber || 'N/A'}
          </p>
          <p className="text-sm text-gray-500">
            Please wait for admin confirmation of your payment.
          </p>
        </div>

        <button
          onClick={() => setCurrentStep('options')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default PaymentSystem;