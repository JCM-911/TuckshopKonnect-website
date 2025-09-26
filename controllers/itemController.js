const Item = require('../models/itemModel');

// @desc    Fetch all items
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const items = await Item.find({});
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single item
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an item
// @route   POST /api/items
// @access  Private/Admin
const createItem = async (req, res) => {
  const { name, price, description, imageUrl } = req.body;

  const item = new Item({
    name,
    price,
    description,
    imageUrl,
    user: req.user._id, // If you want to track who created the item
  });

  try {
    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private/Admin
const updateItem = async (req, res) => {
  const { name, price, description, imageUrl } = req.body;

  try {
    const item = await Item.findById(req.params.id);

    if (item) {
      item.name = name || item.name;
      item.price = price || item.price;
      item.description = description || item.description;
      item.imageUrl = imageUrl || item.imageUrl;

      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private/Admin
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (item) {
      await item.remove();
      res.json({ message: 'Item removed' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getItems, getItemById, createItem, updateItem, deleteItem };