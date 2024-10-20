
// router.get('/', dormController.getAllDorms);
// router.post('/', dormController.createDorm);
// router.put('/:id', dormController.updateDorm);
// router.delete('/:id', dormController.deleteDorm);
 


const express = require('express');
const router = express.Router();
const dormController = require('../controllers/DormController');

// Define routes and attach controller methods
router.post('/create', dormController.createDorm);
router.delete('/delete/:id', dormController.deleteDorm);
router.put('/update/:id', dormController.updateDorm);
router.get('/get/:id', dormController.getDorm);
router.get('/', dormController.getAllDorms); // Add this line to get all dorms

module.exports = router;