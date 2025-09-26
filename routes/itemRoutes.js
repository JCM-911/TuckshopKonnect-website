const express = require('express');
const router = express.Router();
const { getItems, getItemById, createItem, updateItem, deleteItem } = require('../controllers/itemController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getItems).post(protect, admin, createItem);
router.route('/:id').get(getItemById).put(protect, admin, updateItem).delete(protect, admin, deleteItem);

module.exports = router;
