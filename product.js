const express = require('express');
const Product = require('./models/product');
const User = require('./models/user');
const authMiddleWare = require('./authMiddleWare');
const router = express.Router();

router.post('/add', authMiddleWare, async (req, res) => {
  // Logic to add a new product
  try {
    const { productName, description, price, inventoryCount, productImage } = req.body;
    const sellerId = req.user.userId; // Assuming user ID is stored in token payload
    const user = await User.findById(sellerId);
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Seller not found' });
    }
    if(user.userType !== 'seller') {
      return res.status(403).json({ status: 'error', message: 'Only sellers can add products' });
    }
    const product = new Product({
      productName,
      description,
      price,
      seller: sellerId,
      inventoryCount,
      productImage
    });
    const newProduct = await product.save();
    res.status(201).json({ 
      status: 'success', 
      message: 'Product added successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add product', error: error.message });
  }
});

router.get('/list', authMiddleWare, async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ 
      status: 'success', 
      message: 'Products fetched successfully', 
      products 
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch products', error: error.message });
  }
});

router.put('/update/:id', authMiddleWare, async (req, res) => {
  const { productName, description, price, inventoryCount, productImage } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    // Check if the authenticated user is the seller of the product
    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized to update this product' });
    }
    product.productName = productName || product.productName;
    product.description = description || product.description;
    product.price = price || product.price; 
    product.inventoryCount = inventoryCount || product.inventoryCount;
    product.productImage = productImage || product.productImage;

    const updatedProduct = await product.save();
    res.status(200).json({ 
      status: 'success', 
      message: 'Product updated successfully', 
      product: updatedProduct 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update product', error: error.message });
  }
});

router.delete('/delete/:id', authMiddleWare, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized to delete this product' });
    }
    await product.deleteOne();
    res.status(200).json({ status: 'success', message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete product', error: error.message });
  }
});

module.exports = router;