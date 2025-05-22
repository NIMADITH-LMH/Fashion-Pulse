require('dotenv').config();
const mongoose = require('mongoose');
const CommentModel = require('./models/commentModel');

async function connectAndTest() {
    try {
        console.log('Connecting to MongoDB...');
        console.log('MongoDB URI:', process.env.MONGODB_URI);
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB!');
        
        // Create a test comment
        const testComment = new CommentModel({
            productId: '655f5d4c2e3b56a50cc3abe9', // Replace with a valid product ID
            userId: '655f5d4c2e3b56a50cc3abe8',    // Replace with a valid user ID
            text: 'This is a test comment from direct insertion',
            userName: 'Test User',
            rating: 5,
            userImage: null,
            likes: []
        });
        
        console.log('Saving test comment...');
        const savedComment = await testComment.save();
        console.log('Comment saved successfully!');
        console.log('Saved comment:', savedComment);
        
        console.log('Fetching all comments...');
        const allComments = await CommentModel.find({});
        console.log(`Found ${allComments.length} comments in the database`);
        allComments.forEach((comment, index) => {
            console.log(`Comment ${index + 1}: ${comment.text} (ID: ${comment._id})`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// Run the test
connectAndTest(); 