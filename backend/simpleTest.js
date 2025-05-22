require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully!');
        
        // Create a simple schema for the test
        const CommentSchema = new mongoose.Schema({
            productId: mongoose.Schema.Types.ObjectId,
            userId: mongoose.Schema.Types.ObjectId,
            text: String,
            userName: String,
            rating: Number
        }, { timestamps: true });
        
        // Create a model from the schema
        const TestComment = mongoose.model('Comment', CommentSchema);
        
        // Insert a test comment
        console.log('Inserting test comment...');
        const comment = new TestComment({
            productId: new mongoose.Types.ObjectId('655f5d4c2e3b56a50cc3abe9'),
            userId: new mongoose.Types.ObjectId('655f5d4c2e3b56a50cc3abe8'),
            text: 'Test direct comment insertion',
            userName: 'Test User',
            rating: 5
        });
        
        const result = await comment.save();
        console.log('Comment saved successfully!');
        console.log('Comment ID:', result._id);
        
        // Retrieve all comments
        const allComments = await TestComment.find({});
        console.log(`Found ${allComments.length} comments in the database`);
        
        // Close the connection
        await mongoose.connection.close();
        console.log('Test completed successfully');
    } catch (error) {
        console.error('ERROR:', error);
    }
}

// Run the test
run(); 