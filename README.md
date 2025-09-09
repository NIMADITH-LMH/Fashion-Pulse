 # Fashion-Pulse 👗👔

<div align="center">
  <img src="frontend/public/logo192.png" alt="Fashion Pulse Logo" width="150">
  <h3>Revolutionizing Online Shopping with Virtual Try-On Technology</h3>
</div>

## 🌟 Overview

Fashion-Pulse is a cutting-edge e-commerce platform designed to transform the online shopping experience by integrating virtual try-on capabilities with a comprehensive shopping management system. Developed as a university IT Project, this MERN stack application allows users to browse products from various sellers, virtually try on clothes, participate in bidding events, and complete secure transactions - all within an intuitive, responsive interface.

## ✨ Key Features

### 🛍️ For Shoppers
- **Virtual Try-On Experience**: Visualize how clothes look on you without physically trying them
- **Interactive Product Catalog**: Browse items with detailed images and specifications
- **Smart Search & Filtering**: Find products by category, price, seller, ratings, and more
- **Bidding System**: Participate in product auctions with real-time updates
- **Checkout Process**: Complete purchases with simulated payment system (Stripe integration available)
- **Order Tracking**: Monitor order status from purchase to delivery
- **User Profiles**: Save preferences, manage addresses, and view purchase history
- **Reviews & Ratings**: Share experiences and make informed buying decisions

### 🏪 For Sellers
- **Store Management**: Create and customize your virtual store profile
- **Product Management**: Add, edit, and manage product listings with ease
- **Inventory Control**: Track stock levels and receive low stock alerts
- **Order Fulfillment**: Process and manage customer orders efficiently
- **Sales Analytics**: Access comprehensive reports and revenue statistics
- **Auction Hosting**: Set up and manage product bidding events
- **Customer Engagement**: Respond to reviews and interact with customers
- **Revenue Dashboard**: View earnings, commissions, and payment details

### 👑 For Administrators
- **Unified Dashboard**: Monitor platform activity and performance
- **User Management**: Control access rights and permissions
- **Product Oversight**: Review and approve listings
- **Financial Reporting**: Generate detailed reports on transactions and revenue
- **Dispute Resolution**: Manage and resolve user issues
- **System Configuration**: Customize platform settings and parameters
- **Performance Analytics**: Track platform growth and user engagement metrics

## 💻 Technology Stack

### Frontend
- **React.js** - Component-based UI development
- **Redux** - State management across the application
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Axios** - Promise-based HTTP client
- **Chart.js** - Interactive data visualization
- **Leaflet** - Interactive maps for store locations
- **Socket.io** - Real-time communication features

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - MongoDB object modeling tool
- **JWT** - Secure authentication and authorization
- **Stripe** - Payment processing integration (disabled in development mode)
- **Nodemailer** - Email notifications and alerts

### DevOps & Tools
- **Git** - Version control
- **Docker** - Containerization for consistent deployment
- **Jest** - Testing framework
- **Cloudinary** - Cloud-based image management
- **Postman** - API development and testing

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Important Note on Payments
⚠️ **Payment Processing**: The Stripe integration has been temporarily disabled in the development environment. Instead, a mock payment system is in place that simulates the checkout flow without requiring actual Stripe API keys. This makes the application easier to set up and test.

To re-enable Stripe for production:
1. Uncomment the Stripe-related code in:
   - `backend/config/stripe.js`
   - `backend/controller/order/paymentController.js`
   - `backend/controller/order/webhook.js`
2. Add valid Stripe API keys to your `.env` file
3. Update the routes in `backend/routes/index.js` as needed

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NIMADITH-LMH/Fashion-Pulse.git
   cd Fashion-Pulse
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file based on env.sample
   # Add your MongoDB URI and JWT secret
   
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:10000

## 📁 Project Structure

```
Fashion-Pulse/
├── backend/                # Server-side code
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoint definitions
│   └── utils/              # Utility functions
│
├── frontend/               # Client-side code
│   ├── public/             # Static assets
│   └── src/                # React application
│       ├── assets/         # Images, icons, etc.
│       ├── components/     # Reusable UI components
│       ├── context/        # React context providers
│       ├── helpers/        # Helper functions
│       ├── pages/          # Page components
│       └── store/          # Redux state management
```

## 🔮 Roadmap

- **AR Enhancement** - Improved augmented reality try-on experience
- **AI Recommendations** - Personalized product suggestions
- **Mobile App** - Native iOS and Android applications
- **Multi-language Support** - Internationalization
- **Advanced Analytics** - Enhanced business intelligence tools
- **Loyalty Program** - Rewards system for repeat customers
- **Social Shopping** - Collaborative shopping experiences

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Project developed for university IT Project module
- Special thanks to project supervisors and contributors
- Icons provided by [React Icons](https://react-icons.github.io/react-icons/)
- UI inspiration from modern e-commerce platforms

---

<div align="center">
  <p>Developed with ❤️ by NIMADITH-LMH</p>
  <p>© 2025 Fashion-Pulse. All Rights Reserved.</p>
</div>
