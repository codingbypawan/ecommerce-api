const express = require('express');
const router = express.Router();
const authMiddleware = require('./authMiddleWare');
const Product = require('./models/product');
const User = require('./models/user');
const Order = require('./models/order');

// Apply authentication middleware to all routes in this router

router.post('/create', authMiddleware, async (req, res) => {
    try {
        const {productId, quantity} = req.body;
        const customerId = req.user.userId; // Assuming authMiddleware sets req.user

        const customer = User.findById(customerId);
        if (!customer) {
            return res.status(404).send('Customer not found');
        }
        const productDetails = await Product.findById(productId);
        if (!productDetails) {
            return res.status(404).send('Product not found');
        }
        const sellerId = productDetails.seller;

        const Amount = productDetails.price * quantity;
        const order = new Order({
            customerId: customerId,
            sellerId: sellerId,
            product: {
                productId: productId,
                quantity: quantity,
            },
            amount: Amount
        });

        const newOrder = await order.save();
        return res.status(201).json({
            status: 'success',
            message: 'Order created successfully',
            order: newOrder
        });
    } catch (error) {
        console.log('Error creating order:', error.message);
        res.status(500).send('Server Error');
    }
    
});

router.get('/list', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        let orders;
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (user.userType === 'seller') {
            orders = await Order.find({ sellerId: userId }).populate('product.productId', 'productName description productImage').populate('customerId', 'name email');
        }
        if (user.userType === 'customer') {
            orders = await Order.find({ customerId: userId }).populate('product.productId', 'productName description productImage').populate('sellerId', 'name email');
        }
        res.status(200).json({
            status: 'success',
            message: 'Orders fetched successfully',
            orders: orders
        });
    } catch (error) {
        console.log('Error fetching orders:', error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;