# TuckshopKonnect Backend

This is the backend for TuckshopKonnect, a web-based application designed to modernize the traditional school tuck shop system. It provides a seamless and cashless experience for students to make purchases, while offering parents a simple way to manage their children's accounts. The system also includes a comprehensive admin dashboard for managing the tuck shop's inventory, monitoring transactions, and overseeing user accounts.

## Features

- **Cashless Transactions**: Students can make purchases using their pre-funded accounts, eliminating the need for physical cash.
- **Parental Control**: Parents can easily top up their children's accounts and monitor their spending.
- **Inventory Management**: Admins can add, update, and remove items from the tuck shop's inventory.
- **Transaction History**: Detailed logs of all transactions are available for students, parents, and admins.
- **Secure Authentication**: The application uses JWT for secure and role-based authentication.
- **Admin Dashboard**: A powerful dashboard provides admins with a complete overview of the system, including sales, user activity, and inventory levels.

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/tuckshopkonnect-backend.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd tuckshopkonnect-backend
   ```
3. **Install the dependencies:**
   ```bash
   npm install
   ```
4. **Create a `.env` file** in the root directory and add the following environment variables:
   ```
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

### Running the Application

To start the server, run the following command:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Log in an existing user.

### Items

- `GET /api/items` - Get a list of all available items (supports pagination).
- `POST /api/items` - Add a new item to the inventory (admin only).
- `PUT /api/items/:id` - Update an existing item (admin only).
- `DELETE /api/items/:id` - Delete an item from the inventory (admin only).

### Transactions

- `POST /api/transactions` - Create a new transaction (for purchases, deposits, etc.).
- `GET /api/transactions` - Get the transaction history for the logged-in user.
- `GET /api/transactions/all` - Get a list of all transactions (admin only, supports filtering).

### Users

- `GET /api/users` - Get a list of all users (admin only).
- `GET /api/users/profile` - Get the profile of the logged-in user.

## Project Structure

```
.env
├── controllers
│   ├── authController.js
│   ├── itemController.js
│   ├── transactionController.js
│   └── userController.js
├── middleware
│   └── authMiddleware.js
├── models
│   ├── itemModel.js
│   ├── schoolModel.js
│   ├── transactionModel.js
│   └── userModel.js
├── routes
│   ├── authRoutes.js
│   ├── itemRoutes.js
│   ├── transactionRoutes.js
│   └── userRoutes.js
├── test
│   └── test.js
├── .gitignore
├── Admin dashboard.html
├── dashboard.html
├── index.html
├── package-lock.json
├── package.json
├── parent login.html
├── parent-dashboard.html
├── server.js
├── student-login.html
├── student-tuckshop.html
├── update.html
└── wallet.html
```

- **controllers**: Contains the business logic for each route.
- **middleware**: Includes custom middleware, such as authentication checks.
- **models**: Defines the database schemas for users, items, transactions, and schools.
- **routes**: Contains the API route definitions.
- **test**: Includes test files for the application.


