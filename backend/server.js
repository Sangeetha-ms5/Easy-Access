import express from 'express'
import cors from 'cors'
import { MongoClient } from 'mongodb'

const app = express()
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 5000
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017'
const dbName = process.env.MONGO_DB_NAME || 'easyaccess'

let client
let db

async function connectToMongo() {
  if (db) return db

  client = new MongoClient(mongoUri)
  await client.connect()
  db = client.db(dbName)
  console.log('Connected to MongoDB')
  return db
}

app.get('/health', async (_req, res) => {
  try {
    await connectToMongo()
    res.json({ status: 'ok', database: dbName })
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
})

app.get('/schemes', async (_req, res) => {
  try {
    const database = await connectToMongo()
    const schemes = await database.collection('schemes').find({}).toArray()
    res.json(schemes)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/schemes', async (req, res) => {
  try {
    const database = await connectToMongo()
    const result = await database.collection('schemes').insertOne(req.body)
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`)
})
