# Green Community - Environmental Impact Tracking Platform

A comprehensive platform for tracking environmental impact, managing carbon footprints, and building a sustainable community. This project includes a modern React/Next.js frontend and a robust Node.js backend with MongoDB integration.

## 🌱 Features

- **Carbon Footprint Calculator**: Track and calculate personal carbon emissions
- **Community Dashboard**: Connect with environmentally conscious users
- **Marketplace**: Browse and purchase eco-friendly products
- **User Management**: Complete authentication and profile management
- **Admin Panel**: Administrative tools for platform management
- **Real-time Chat**: Community interaction features

## 🛠️ Tech Stack

**Frontend (Client):**
- Next.js 14+ with Turbopack
- React with modern hooks
- Tailwind CSS for styling
- Radix UI components
- Shadcn/ui component library

**Backend (Server):**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- Cloudinary for image storage
- bcryptjs for password hashing
- Email service integration

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) installed on your system
- [Node.js](https://nodejs.org/) (if running locally without Docker)

## 🚀 Quick Start with Docker

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Bhavya-Sonigra/GreenCommunity.git
    cd GreenCommunity
    ```

2.  **Environment Configuration**

    Create a `.env` file in the `Server/` directory with the following variables:

    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    JWT_REFRESH_SECRET=your_jwt_refresh_secret
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_email_app_password
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    CLIENT_URL=http://localhost:3000
    SERVER_URL=http://localhost:5000
    ```

3.  **Run the deployment script**

    Two deployment scripts are provided for different operating systems:

    **For Windows PowerShell:**

    ```powershell
    .\deploy.ps1
    ```

    **For Linux and macOS:**

    ```bash
    chmod +x deploy.sh
    ./deploy.sh
    ```

    The deployment script will:
    - Verify Docker and Docker Compose installation
    - Check for the required `.env` file in the Server directory
    - Build Docker images with no cache for fresh builds
    - Stop any existing containers and remove orphaned volumes
    - Start all services in detached mode
    - Display container status and recent logs

## 🔧 Manual Setup (Without Docker)

If you prefer to run the application locally without Docker:

1. **Install dependencies for both client and server:**

   ```bash
   # Install server dependencies
   cd Server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

2. **Start the development servers:**

   ```bash
   # Start the backend server (from Server directory)
   cd Server
   npm run dev
   
   # Start the frontend client (from client directory, in a new terminal)
   cd client
   npm run dev
   ```

## 🌐 Accessing the Application

Once deployed, the application will be available at:

-   **Frontend (Client):** [http://localhost:3000](http://localhost:3000)
-   **Backend API (Server):** [http://localhost:5000](http://localhost:5000)

## 📱 API Testing

The project includes Postman collections for API testing:

- Import `GreenCommunity-Postman-Collection-Clean.json` into Postman
- Use `requests.http` file for REST client testing in VS Code

## 🔧 Development Commands

**Docker Commands:**

```bash
# View real-time logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f server
docker-compose logs -f client

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down --volumes

# Restart all services
docker-compose restart

# Rebuild and restart
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

**Development Scripts:**

```bash
# Server development with auto-reload
cd Server && npm run dev

# Client development with Turbopack
cd client && npm run dev

# Build for production
cd client && npm run build

# Run linting
cd client && npm run lint
```

## 📁 Project Structure

```
GreenCommunity/
├── client/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable React components
│   │   └── lib/          # Utility functions
│   ├── public/           # Static assets
│   └── Dockerfile        # Client container config
├── Server/               # Node.js Backend
│   ├── config/          # Database and service configs
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth and validation middleware
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic services
│   └── Dockerfile      # Server container config
├── docker-compose.yml   # Multi-container setup
├── deploy.ps1          # Windows deployment script
├── deploy.sh           # Unix deployment script
└── README.md           # Project documentation
```

## 🧪 Testing

Test files are available for API testing:

- `test-footprintlog.js` - JavaScript test file for footprint logging
- `test-footprintlog.ps1` - PowerShell test script
- `requests.http` - HTTP request collection for VS Code REST Client

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS configuration
- Secure cookie handling
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Environment Variables

Ensure your `Server/.env` file includes all necessary variables:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secrets
JWT_SECRET=your_very_secure_jwt_secret
JWT_REFRESH_SECRET=your_very_secure_refresh_secret

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
```

## 🚨 Troubleshooting

**Common Issues:**

1. **Port already in use**: Stop existing services or change ports in docker-compose.yml
2. **Environment variables**: Ensure all required variables are set in Server/.env
3. **Docker issues**: Restart Docker Desktop and try rebuilding containers
4. **Database connection**: Verify MongoDB URI and network connectivity

**Debug Commands:**

```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs --tail=50

# Access container shell
docker-compose exec server bash
docker-compose exec client bash

# Reset everything
docker-compose down --volumes --rmi all
docker system prune -f
```

## 📄 License

This project is licensed under the ISC License.

## 📧 Contact

For questions or support, please contact the development team or create an issue in the repository.

---

**Last Updated:** August 18, 2025
