const Dorm = require('../models/Dorm');

exports.getAllDorms = async (req, res) => {
  try {
    const dorms = await Dorm.find();
    res.json(dorms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDorm = async (req, res) => {
  try {
    const dorm = await Dorm.findById(req.params.id);
    if (!dorm) {
      return res.status(404).json({ message: 'Dorm not found' });
    }
    res.json(dorm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDorm = async (req, res) => {
  const dorm = new Dorm(req.body);
  try {
    const newDorm = await dorm.save();
    res.status(201).json(newDorm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateDorm = async (req, res) => {
  try {
    const updatedDorm = await Dorm.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDorm) {
      return res.status(404).json({ message: 'Dorm not found' });
    }
    res.json(updatedDorm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteDorm = async (req, res) => {
  try {
    const deletedDorm = await Dorm.findByIdAndDelete(req.params.id);
    if (!deletedDorm) {
      return res.status(404).json({ message: 'Dorm not found' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};