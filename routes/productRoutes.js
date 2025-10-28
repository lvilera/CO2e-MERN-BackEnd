const express = require('express');
const multer = require('multer');
const { storage4 } = require('../cloudinary');
const upload = multer({ storage: storage4 });
const Product = require('../models/Product');
const stripe = require('../configs/stripe.config');

const router = express.Router();

// Add Product
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, description, price, fileURL } = req.body;
        const image = req.file;

        if (!title || !description || !price || !fileURL || !image) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // 1️⃣ Create Product on Stripe
        const stripeProduct = await stripe.products.create({
            name: title,
            description,
            images: [image.path],
        });

        // 2️⃣ Create Price on Stripe
        const stripePrice = await stripe.prices.create({
            unit_amount: Math.round(Number(price) * 100), // convert to cents
            currency: 'cad',
            product: stripeProduct.id,
        });

        // 3️⃣ Save Product to DB
        const newProduct = new Product({
            title,
            description,
            price,
            fileURL,
            imageURL: image.path,
            stripeProductId: stripeProduct.id,
            stripePriceId: stripePrice.id,
        });

        await newProduct.save();

        res.status(201).json({
            message: 'Product added successfully.',
            product: newProduct,
        });
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get all Products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Product by ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // 1️⃣ Delete from Stripe (product + price)
        try {
            if (product.stripeProductId) {
                await stripe.products.update(product.stripeProductId, { active: false });
            }
            if (product.stripePriceId) {
                await stripe.prices.update(product.stripePriceId, { active: false });
            }
        } catch (stripeErr) {
            console.warn('Stripe deletion warning:', stripeErr.message);
        }

        // 2️⃣ Delete from DB
        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Product
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, description, price, fileURL } = req.body;
        const image = req.file;
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const updateFields = {
            ...(title && { title }),
            ...(description && { description }),
            ...(fileURL && { fileURL }),
            ...(price && { price }),
            ...(image && { imageURL: image.path }),
        };

        // 1️⃣ Update on Stripe
        if (product.stripeProductId) {
            await stripe.products.update(product.stripeProductId, {
                ...(title && { name: title }),
                ...(description && { description }),
                ...(image && { images: [image.path] }),
            });
        }

        // 2️⃣ If price changed, create new Stripe price
        if (price && product.stripeProductId && Number(price) !== Number(product.price)) {
            const newPrice = await stripe.prices.create({
                unit_amount: Math.round(Number(price) * 100),
                currency: 'cad',
                product: product.stripeProductId,
            });
            updateFields.stripePriceId = newPrice.id;

            // Optionally deactivate old price
            if (product.stripePriceId) {
                await stripe.prices.update(product.stripePriceId, { active: false });
            }
        }

        // 3️⃣ Update in DB
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        );

        res.json(updatedProduct);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;