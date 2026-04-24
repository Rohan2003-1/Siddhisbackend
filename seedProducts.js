const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
const User = require('./src/models/User');

dotenv.config();

const products = [
  {
    name: 'Dell Inspiron 15 Laptop',
    description: 'Powerful Dell Inspiron 15 with Intel Core i5, 16GB RAM, 512GB SSD. Perfect for students and professionals.',
    price: 54999,
    originalPrice: 64999,
    brand: 'Dell',
    badge: 'Best Seller',
    categoryName: 'Laptops',
    stock: 12,
    images: [{ url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&q=80', public_id: 'prod1' }],
    ratings: 4.5,
    numReviews: 128
  },
  {
    name: 'HP Pavilion Gaming PC',
    description: 'High-performance gaming desktop with RTX 3060, AMD Ryzen 7, and 1TB NVMe SSD.',
    price: 89999,
    originalPrice: 109999,
    brand: 'HP',
    badge: 'Hot Deal',
    categoryName: 'Desktops',
    stock: 5,
    images: [{ url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=80', public_id: 'prod2' }],
    ratings: 4.7,
    numReviews: 85
  },
  {
    name: 'Samsung 27" 4K Monitor',
    description: '27-inch 4K UHD IPS monitor with 144Hz refresh rate and HDR400 support.',
    price: 29999,
    originalPrice: 35999,
    brand: 'Samsung',
    categoryName: 'Monitors',
    stock: 20,
    images: [{ url: 'https://images.unsplash.com/photo-1527443224154-c4a573d81e88?w=500&q=80', public_id: 'prod3' }],
    ratings: 4.6,
    numReviews: 203
  },
  {
    name: 'Logitech MX Master 3 Mouse',
    description: 'Advanced wireless mouse with 4000 DPI, ergonomic design, and 70-day battery life.',
    price: 8999,
    originalPrice: 10999,
    brand: 'Logitech',
    badge: 'Top Rated',
    categoryName: 'Accessories',
    stock: 50,
    images: [{ url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80', public_id: 'prod4' }],
    ratings: 4.8,
    numReviews: 456
  },
  {
    name: 'Apple MacBook Air M2',
    description: 'Apple MacBook Air with M2 chip, 13.6" Liquid Retina display, 18-hour battery.',
    price: 114999,
    originalPrice: 124999,
    brand: 'Apple',
    badge: 'Premium',
    categoryName: 'Laptops',
    stock: 8,
    images: [{ url: 'https://images.unsplash.com/photo-1611186871525-59340efd0e9c?w=500&q=80', public_id: 'prod5' }],
    ratings: 4.9,
    numReviews: 312
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Find or create an admin user to own the products
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin found, seeding products with a dummy user ID (this might fail if validation is strict)');
      // For seeding, we'll just use a random ID if no user exists, but it's better to have one
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@siddhis.com',
        password: 'password123',
        role: 'admin',
        isVerified: true
      });
    }

    await Product.deleteMany();
    console.log('Deleted existing products');

    const allCategories = await Category.find();
    console.log('Available categories in DB:', allCategories.map(c => c.name));

    for (const p of products) {
      const category = allCategories.find(c => c.name.toLowerCase() === p.categoryName.toLowerCase());
      if (category) {
        await Product.create({
          ...p,
          category: category._id,
          user: admin._id
        });
        console.log(`Created product: ${p.name}`);
      } else {
        console.log(`Category ${p.categoryName} not found, skipping product ${p.name}`);
      }
    }

    console.log('Products seeded successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
