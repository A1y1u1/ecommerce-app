const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB for seeding'))
.catch(err => console.error('MongoDB connection error:', err));

// Define schemas
const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    stock: { type: Number, default: 0 },
    material: String,
    application: String,
    size: String,
    color: String,
    qtyPerBox: Number,
    coverageArea: String,
    noOfBoxes: Number,
    perBoxPrice: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    image: String,
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);

// Sample data
const categories = [
    {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        image: 'https://example.com/electronics.jpg'
    },
    {
        name: 'Clothing',
        description: 'Fashion and apparel',
        image: 'https://example.com/clothing.jpg'
    },
    {
        name: 'Tiles',
        description: 'Flooring and wall tiles',
        image: 'https://example.com/tiles.jpg'
    }
];

const products = [
    {
        title: 'Smartphone X',
        description: 'Latest smartphone with advanced features',
        price: 999.99,
        category: 'Electronics',
        image: 'https://example.com/smartphone.jpg',
        stock: 50,
        material: 'Metal and Glass',
        color: 'Black'
    },
    {
        title: 'Designer T-Shirt',
        description: 'Premium quality cotton t-shirt',
        price: 49.99,
        category: 'Clothing',
        image: 'https://example.com/tshirt.jpg',
        stock: 100,
        size: 'M',
        color: 'White'
    },
    {
        title: 'Ceramic Floor Tile',
        description: 'High-quality ceramic floor tile',
        price: 29.99,
        category: 'Tiles',
        image: 'https://example.com/tile.jpg',
        stock: 200,
        material: 'Ceramic',
        size: '12x12 inches',
        coverageArea: '1 sq ft',
        qtyPerBox: 10,
        perBoxPrice: 299.99
    }
];

// Seed function
async function seedDatabase() {
    try {
        // Clear existing data
        await Product.deleteMany({});
        await Category.deleteMany({});
        console.log('Cleared existing data');

        // Insert categories
        const insertedCategories = await Category.insertMany(categories);
        console.log('Inserted categories');

        // Insert products
        const insertedProducts = await Product.insertMany(products);
        console.log('Inserted products');

        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the seed function
seedDatabase(); 