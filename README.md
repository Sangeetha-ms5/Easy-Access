# Easy Access Government Website

## Backend setup

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the project root with your MongoDB connection string:
   ```bash
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017
   MONGO_DB_NAME=easyaccess
   ```
3. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

## Frontend setup

```bash
pnpm dev
```

## MongoDB connection options

- Local MongoDB: `mongodb://127.0.0.1:27017`
- MongoDB Atlas: `mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority`
