const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

// ==========================================
// ENTER YOUR NEW CREDENTIALS BELOW
// ==========================================
const NEW_EMAIL = 'sivanesansamy1@gmail.com';
const NEW_PASSWORD = 'Siva@2005';
// ==========================================

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('MongoDB Connected for Admin Update...');

    // Delete existing admin records to prevent duplicates
    await Admin.deleteMany({});

    // Create new admin with updated credentials
    const admin = await Admin.create({
        email: NEW_EMAIL,
        password: NEW_PASSWORD
    });

    console.log(`✅ Admin credentials updated successfully!`);
    console.log(`📧 New Email: ${admin.email}`);
    console.log(`(Your password has been securely hashed and saved in the database)`);
    process.exit(0);
}).catch(err => {
    console.error('❌ Error updating admin:', err);
    process.exit(1);
});
