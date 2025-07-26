# TummyMate Server Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- MySQL database
- npm or yarn

## Setup Steps

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Setup Database

1. Create a MySQL database named `tummymate_db`
2. Copy `.env.example` to `.env`
3. Update database credentials in `.env`:
   ```
   DATABASE_URL="mysql://username:password@localhost:3306/tummymate_db"
   ```

### 3. Setup Prisma

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Optional: Run migrations instead of push
npm run db:migrate
```

### 4. Seed Database (Optional)

```bash
npm run db:seed
```

### 5. Start Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with demo data

## API Endpoints

### Health Check

- `GET /api/health` - Server health check
- `GET /api/db-test` - Database connection test

### Meal Plans

- `GET /api/meal-plans` - Get all meal plans
- `POST /api/meal-plans` - Create new meal plan

### Shopping Logs

- `GET /api/shopping-logs` - Get all shopping logs
- `POST /api/shopping-logs` - Create new shopping log

### Jajan Logs

- `GET /api/jajan-logs` - Get all jajan logs
- `POST /api/jajan-logs` - Create new jajan log

## Database Schema

The database includes the following tables:

- `meal_plans` - Main meal plan entries
- `meal_plan_details` - Detailed meal information
- `shopping_logs` - Shopping trip records
- `shopping_details` - Individual shopping items
- `jajan_logs` - Eating out records
- `users` - User accounts (future use)

## Troubleshooting

### Database Connection Issues

1. Ensure MySQL server is running
2. Check database credentials in `.env`
3. Verify database `tummymate_db` exists
4. Test connection: `GET /api/db-test`

### Prisma Issues

1. Regenerate client: `npm run db:generate`
2. Reset database: `npx prisma db push --force-reset`
3. Check schema: `npx prisma studio`

### Port Conflicts

- Default port is 3001
- Change PORT in `.env` if needed
- Ensure frontend CORS_ORIGIN matches your frontend URL

## Development Tips

1. Use Prisma Studio to view/edit data: `npm run db:studio`
2. Check server logs for debugging
3. Test API endpoints with Postman or curl
4. Monitor database queries in development mode

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a production MySQL database
3. Configure proper CORS origins
4. Use PM2 or similar for process management
5. Setup proper logging and monitoring
