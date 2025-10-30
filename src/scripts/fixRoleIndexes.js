import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';

const fixRoleIndexes = async () => {
  try {
    await connectDB();
    
    // Get the Role collection
    const roleCollection = mongoose.connection.collection('roles');
    
    // Drop the existing indexes
    const indexes = await roleCollection.indexes();
    for (const index of indexes) {
      if (index.name !== '_id_') { // Don't drop the _id index
        await roleCollection.dropIndex(index.name);
      }
    }
    
    // Create the new compound unique index
    await roleCollection.createIndex(
      { roleName: 1, companyId: 1 },
      { unique: true }
    );
    
    console.log('Successfully updated Role collection indexes');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing role indexes:', error);
    process.exit(1);
  }
};

fixRoleIndexes();