import { sequelize } from '../src/config/database.js';

const addIsActiveField = async () => {
  try {
    console.log('🔄 Adding isActive field to User model...');
    
    // Check if the column already exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'isActive'
      AND TABLE_SCHEMA = DATABASE()
    `);

    if (results.length > 0) {
      console.log('✅ isActive field already exists in users table');
      await sequelize.close();
      return;
    }

    // Add the isActive column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN isActive BOOLEAN NOT NULL DEFAULT TRUE
    `);

    console.log('✅ Successfully added isActive field to users table');
    console.log('✅ All existing users have been set to active by default');

  } catch (error) {
    console.error('❌ Error adding isActive field:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

const main = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    await addIsActiveField();
    
    console.log('🎉 Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

main();