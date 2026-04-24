const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./src/models/Category');

dotenv.config();

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    await Category.deleteMany();
    await Category.create([
      { name: 'Laptops', description: 'Portable computers', icon: '💻' },
      { name: 'Desktops', description: 'Stationary computers', icon: '🖥️' },
      { name: 'Monitors', description: 'Display screens', icon: '📺' },
      { name: 'Accessories', description: 'Keyboards, mice, etc.', icon: '⌨️' },
      { name: 'Networking', description: 'Routers, switches, etc.', icon: '📡' }
    ]);
    console.log('Categories seeded successfully');
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedCategories();
