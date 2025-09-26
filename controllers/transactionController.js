const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// Create a new transaction with atomicity and validation
const createTransaction = async (req, res) => {
  const { amount, type, description, userId, items } = req.body;

  // Validate input
  if (!amount || !type || !userId || (type === 'purchase' && !items)) {
    return res.status(400).json({ message: 'Missing required fields for transaction.' });
  }
  if (amount <= 0) {
    return res.status(400).json({ message: 'Transaction amount must be positive.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    // Handle balance changes based on transaction type
    if (type === 'deposit' || type === 'refund') {
      user.balance += amount;
    } else if (type === 'purchase') {
      if (user.balance < amount) {
        return res.status(400).json({ message: 'Insufficient funds for this purchase.' });
      }
      user.balance -= amount;
    }

    await user.save({ session });

    const transaction = new Transaction({
      user: userId,
      amount,
      type,
      description,
      items: type === 'purchase' ? items : [],
      status: 'completed',
    });

    await transaction.save({ session });

    await session.commitTransaction();
    res.status(201).json({ transaction, message: 'Transaction created successfully.' });

  } catch (error) {
    await session.abortTransaction();
    console.error('Create Transaction Error:', error);
    res.status(500).json({ message: `Transaction failed: ${error.message}` });
  } finally {
    session.endSession();
  }
};

// Get transactions for the currently logged-in user with pagination
const getUserTransactions = async (req, res) => {
    const { page = 1, limit = 10, type } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;

    try {
        const transactions = await Transaction.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('items.item', 'name price');

        const count = await Transaction.countDocuments(filter);

        res.json({
            transactions,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error('Get User Transactions Error:', error);
        res.status(500).json({ message: 'Error fetching user transactions.' });
    }
};


// Get all transactions for all users (admin only) with advanced filtering
const getAllTransactions = async (req, res) => {
  const { page = 1, limit = 10, userId, type, status } = req.query;
  const filter = {};

  if (userId) filter.user = userId;
  if (type) filter.type = type;
  if (status) filter.status = status;

  try {
    const transactions = await Transaction.find(filter)
      .populate('user', 'name email studentId') // Populate user details
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const count = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Get All Transactions Error:', error);
    res.status(500).json({ message: 'Server error while fetching all transactions.' });
  }
};

module.exports = { createTransaction, getUserTransactions, getAllTransactions };