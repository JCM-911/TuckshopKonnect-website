const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  const { amount, type, description, status, userId } = req.body;

  try {
    // Find the user to associate with the transaction
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transaction = new Transaction({
      user: user._id,
      amount,
      type,
      description,
      status,
    });

    // If it's a deposit or purchase, update the user's balance
    if (type === 'deposit') {
      user.balance += amount;
    } else if (type === 'purchase') {
      if (user.balance < amount) {
        return res.status(400).json({ message: 'Insufficient funds' });
      }
      user.balance -= amount;
    }

    await user.save();
    const createdTransaction = await transaction.save();

    res.status(201).json(createdTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all transactions (admin only)
// @route   GET /api/transactions/all
// @access  Private/Admin
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({}).populate('user', 'id name');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTransaction, getUserTransactions, getAllTransactions };