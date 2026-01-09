# Relnodes

Visualize your LinkedIn network on an interactive 3D globe. Upload your connections CSV and explore your professional network geographically.

## Features

- Upload LinkedIn connections via CSV export
- Interactive 3D globe visualization using WebGL
- Automatic geocoding of connection locations
- Manual location editing with city autocomplete
- Company-based referral finder
- Connection tagging and notes
- User authentication and data isolation

## Tech Stack

- Next.js 16 with App Router
- TypeScript
- Prisma ORM with PostgreSQL
- NextAuth.js for authentication
- react-globe.gl for 3D visualization
- Tailwind CSS for styling
- Framer Motion for animations

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Neon)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and NextAuth secret

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. Sign up or sign in
2. Export your LinkedIn connections CSV (Settings & Privacy → Data Privacy → Get a copy of your data → Connections)
3. Upload the CSV file
4. Locations are automatically mapped in the background
5. Explore your network on the globe, find referrals by company, and manage connections

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret for NextAuth.js (generate with `openssl rand -base64 32`)

## Deployment

The application is configured for deployment on Vercel with serverless PostgreSQL (Neon).

## License

MIT
