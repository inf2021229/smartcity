const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const multer = require("multer");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: "50mb" }));

const uri = process.env.MONG_CONN;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDB() {
  try {
    await client.connect();
    const db = client.db("admin");
    const result = await db.command({ ping: 1 });
    console.log("Connected to MongoDB using MongoClient");
    console.log("Ping successful:", result);
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

connectToDB();

const db = client.db("smart_city_db");
const reportsCollection = db.collection("reports");
const usersCollection = db.collection("users");

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = { email, password: hashedPassword, createdAt: new Date() };
    await usersCollection.insertOne(newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const safeUser = {
      _id: user._id,
      email: user.email,
      is_admin: !!user.is_admin
    };

    return res.status(200).json({
      message: 'Login successful',
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const { userId } = req.query;

    const filter = userId ? { userId: new ObjectId(userId) } : {};

    const reports = await reportsCollection.find(filter).toArray();

    const formattedReports = reports.map(report => ({
      ...report,
      image: report.image ? `data:image/jpeg;base64,${report.image.toString("base64")}` : null,
    }));

    res.status(200).json(formattedReports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/reports', upload.single("image"), async (req, res) => {
  try {
    const { description, latitude, longitude, status = "1", userId } = req.body;

    if (!description || !latitude || !longitude) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let validUserId = null;
    if (userId) {
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      if (user) validUserId = user._id;
      else console.warn('Report submitted with non-existent userId:', userId);
    }

    let imageBuffer = null;
    if (req.file) imageBuffer = req.file.buffer;

    console.log("Received Image Blob:", imageBuffer ? "Photo Blob Received" : "No Image");

    const newReport = {
      description,
      latitude: Number(latitude),
      longitude: Number(longitude),
      status: Number(status),
      image: imageBuffer,
      userId: validUserId,
      createdAt: new Date(),
    };

    const result = await reportsCollection.insertOne(newReport);

    res.status(201).json({ 
      message: 'Report created successfully', 
      report: { _id: result.insertedId, ...newReport }
    });
    console.log("Report saved with ID:", result.insertedId);
  } catch (error) {
    console.error("Error saving report:", error);
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/reports/:id/status', async (req, res) => {
  const { id } = req.params;
  const sNum = Number(req.body?.status);

  if (![0, 1, 2].includes(sNum)) {
    return res.status(400).json({ message: 'Invalid status. Use 0, 1, or 2.' });
  }

  try {
    const _id = new ObjectId(id);

    const result = await reportsCollection.findOneAndUpdate(
      { _id },
      { $set: { status: sNum, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return res.status(200).json({ message: 'Status updated', report: result.value });
  } catch (err) {
    console.error('PATCH status error:', err);
    return res.status(500).json({ message: err.message });
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const _id = new ObjectId(id);
    const result = await reportsCollection.deleteOne({ _id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.status(200).json({ message: 'Report deleted' });
  } catch (err) {
    console.error('DELETE report error:', err);
    return res.status(500).json({ message: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port http://localhost:${PORT}`);
});

const URL = process.env.URL

async function keepAwake() {
  try {
    const res = await fetch(URL);
    const time = new Date().toLocaleTimeString();
    console.log(`[${time}] Pinged ${URL} — status ${res.status}`);
  } catch (err) {
    console.error("Keep-alive ping failed:", err.message);
  }
}

setInterval(keepAwake, 10 * 60 * 1000);