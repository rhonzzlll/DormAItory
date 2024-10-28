const express = require('express');
const router = express.Router();
const dormController = require('../controllers/DormController');

// Define routes and attach controller methods
router.post('/create', dormController.createDorm);
router.delete('/delete/:id', dormController.deleteDorm);
router.put('/update/:id', dormController.updateDorm);
router.get('/get/:id', dormController.getDorm); // This should match the fetch URL
router.get('/', dormController.getAllDorms);

module.exports = router;