const express = require('express');
const router = express.Router();
const { createTransaction, getUserTransactions, getAllTransactions } = require('../controllers/transactionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createTransaction).get(protect, getUserTransactions);
router.route('/all').get(protect, admin, getAllTransactions);

module.exports = router;
