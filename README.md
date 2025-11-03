# C-Square: Carbon Credits Marketplace

## Objective

C-Square is a blockchain-powered platform designed to revolutionize carbon offsetting by providing a transparent, secure, and efficient marketplace for buying and selling verified carbon credits. The platform tokenizes carbon credits as NFTs, ensuring traceability and immutability on the blockchain. It connects companies (buyers and sellers) with verified environmental projects, enabling real-time tracking of carbon offsets, retirement of credits, and measurable impact on sustainability. The goal is to accelerate global decarbonization efforts by making carbon trading accessible, trustworthy, and impactful.

## Description

C-Square bridges the gap between environmental projects and organizations seeking to offset their carbon footprint. Buyers can browse and purchase credits from projects like forest protection, renewable energy, and carbon capture, verified by trusted registries (e.g., Verra, Gold Standard). Sellers (project developers/verifiers) can list and manage their projects. All transactions are recorded on the blockchain for full transparency. The platform includes dashboards for tracking metrics, an explorer for public activity, and admin tools for oversight.

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Radix UI components
- **Routing**: React Router DOM
- **State Management**: TanStack React Query
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with Google OAuth 2.0
- **Security**: bcrypt, JWT, cookie-parser
- **Utilities**: nanoid, dotenv
- **Blockchain**: Stubbed integration (Ethereum/Polygon ready)

## Features

- **Marketplace**: Browse, filter, and purchase carbon credits from global projects.
- **Buyer Dashboard**: Track offsets, active/retired credits, investments, and monthly trends.
- **Seller Dashboard**: Manage projects, view metrics (credits issued/sold, revenue).
- **Authentication**: Google OAuth login with session management.
- **Company Profiles**: Support for buyers/sellers with metrics and badges.
- **Project Management**: CRUD for projects with verifier integration.
- **Transactions**: Purchase, retirement, and blockchain recording.
- **Explorer Feed**: Public view of retired credits and transactions.
- **Admin Panel**: Manage companies and projects.
- **Responsive UI**: Dark/light themes, mobile-friendly.
- **API**: RESTful endpoints for all operations.

## Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Git

### Backend Setup
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd C-Square--main/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/csquare
   PORT=5000
   CLIENT_URL=http://localhost:5173
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   JWT_SECRET=<your-jwt-secret>
   ```

4. Seed the database (optional):
   ```bash
   npm run seed
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

1. **Sign Up/Login**: Use Google OAuth to create an account as a buyer or seller.
2. **Marketplace**: Browse projects, filter by type/country, and purchase credits.
3. **Dashboard**: View metrics, credits, and transactions.
4. **Retire Credits**: Permanently offset credits via the dashboard.
5. **Admin**: Access admin routes for management (if role is admin).

## Deployment

- **Frontend**: Deployed on Vercel. Configure `vercel.json` for SPA routing.
- **Backend**: Deploy to Heroku, Railway, or similar. Ensure MongoDB is accessible.
- **Database**: Use MongoDB Atlas for production.
- **Blockchain**: Integrate with a full smart contract (e.g., via Web3.js) for minting/transfers.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m 'Add your feature'`.
4. Push to branch: `git push origin feature/your-feature`.
5. Open a Pull Request.

## License

ISC License. See LICENSE file for details.
