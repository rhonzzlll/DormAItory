const PaymentMethod = require('../models/PaymentMethod');

exports.getAllPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find();
    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPaymentMethod = async (req, res) => {
  try {
    // Check if already have 2 payment methods
    const existingMethods = await PaymentMethod.countDocuments();
    if (existingMethods >= 2) {
      return res.status(400).json({ message: 'Maximum of 2 payment methods allowed' });
    }

    const paymentMethod = new PaymentMethod(req.body);
    const newPaymentMethod = await paymentMethod.save();
    res.status(201).json(newPaymentMethod);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePaymentMethod = async (req, res) => {
  try {
    const updatedMethod = await PaymentMethod.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    res.json(updatedMethod);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePaymentMethod = async (req, res) => {
  try {
    const deletedMethod = await PaymentMethod.findByIdAndDelete(req.params.id);
    
    if (!deletedMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};