const Item = require('../models/itemModel');

// Advanced fetch for all items with filtering, pagination, and sorting
const getItems = async (req, res) => {
  const { page = 1, limit = 10, search, sortBy = 'createdAt', order = 'desc' } = req.query;
  
  const filter = search ? {
    name: {
      $regex: search,
      $options: 'i'
    } // Case-insensitive search
  } : {};

  const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

  try {
    const items = await Item.find(filter)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const count = await Item.countDocuments(filter);

    res.json({
      items,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Get Items Error:', error);
    res.status(500).json({ message: 'Server error while fetching items.' });
  }
};

// Fetch a single item by its ID
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    console.error('Get Item by ID Error:', error);
    res.status(500).json({ message: 'Server error while fetching the item.' });
  }
};

// Create a new item with proper validation
const createItem = async (req, res) => {
  const { name, price, description, imageUrl, category } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Item name and price are required.' });
  }
  if (price < 0) {
    return res.status(400).json({ message: 'Price cannot be negative.' });
  }

  try {
    const newItem = new Item({
      name,
      price,
      description,
      imageUrl,
      category
    });

    const createdItem = await newItem.save();
    res.status(201).json({ item: createdItem, message: 'Item created successfully.' });
  } catch (error) {
    console.error('Create Item Error:', error);
    res.status(400).json({ message: 'Error creating item.' });
  }
};

// Update an existing item efficiently
const updateItem = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.price && updateData.price < 0) {
        return res.status(400).json({ message: 'Price cannot be negative.' });
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure schema validation is run
    });

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ item: updatedItem, message: 'Item updated successfully.' });
  } catch (error) {
    console.error('Update Item Error:', error);
    res.status(400).json({ message: 'Error updating item.' });
  }
};

// Delete an item safely
const deleteItem = async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item removed successfully.' });
  } catch (error) {
    console.error('Delete Item Error:', error);
    res.status(500).json({ message: 'Error deleting item.' });
  }
};

module.exports = { getItems, getItemById, createItem, updateItem, deleteItem };