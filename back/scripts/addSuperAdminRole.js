import { sequelize } from '../src/config/database.js';
import { User } from '../src/models/User.js';

/**
 * Migration script to add 'super_admin' role to the User model
 * Simplified version that uses Sequelize's built-in migration capabilities
 */
(async () => {
  try {
    console.log('Starting migration: Adding super_admin role to User model...');
    
    // Use Sequelize sync with alter to update the schema
    // This automatically handles the ENUM update for MySQL
    await User.sync({ alter: true });
    
    console.log('Migration completed successfully: super_admin role added to User model');
    console.log('Available roles: cliente, admin, super_admin');
    
  } catch (error) {
    console.error('Error during migration:', error);
    console.error('Please ensure:');
    console.error('1. Database is running and accessible');
    console.error('2. User model has been updated with super_admin role');
    console.error('3. Database user has ALTER privileges');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();