# TuckshopKonnect Backend (Python/Flask)

This is the backend for TuckshopKonnect, a web-based application designed to modernize the traditional school tuck shop system. This backend is built with Python and the Flask framework.

## Features

- **Cashless Transactions**: Students can make purchases using their pre-funded accounts, eliminating the need for physical cash.
- **Parental Control**: Parents can easily top up their children's accounts and monitor their spending.
- **Inventory Management**: Admins can add, update, and remove items from the tuck shop's inventory.
- **Transaction History**: Detailed logs of all transactions are available for students, parents, and admins.
- **Secure Authentication**: The application uses JWT for secure and role-based authentication.
- **Admin Dashboard**: A powerful dashboard provides admins with a complete overview of the system, including sales, user activity, and inventory levels.

## Getting Started

### Prerequisites

- Python 3.8+
- pip
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
   pip install -r requirements.txt
   ```
4. **Create a `.env` file** in the root directory and add the following environment variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

### Running the Application Locally

To start the server, run the following command:

```bash
python app.py
```

The application will be available at `http://localhost:5000`.

## API Endpoints

### Authentication

- `POST /api/auth/login` - Log in an existing user.


## Project Structure

```
.env
├── .gitignore
├── app.py
├── requirements.txt
├── render.yaml
├── Admin dashboard.html
├── dashboard.html
├── index.html
├── parent login.html
├── parent-dashboard.html
├── student-login.html
├── student-tuckshop.html
├── update.html
└── wallet.html
```

- **app.py**: The main Flask application file. It handles API routes and serves the frontend.
- **requirements.txt**: A list of the Python dependencies for the project.
- **render.yaml**: Configuration file for deploying the application on the Render hosting service.
- **.html files**: The frontend of the application.
