const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const Journal = require('./models/Journal');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files (like CSS, JS, images) from the root directory
app.use(express.static(__dirname));

// Default route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Routes

// Get all journals
app.get('/journals', async (req, res) => {
  try {
    const journals = await Journal.find();
    res.json(journals);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching journals' });
  }
});

// Create a new journal
app.post('/journals', async (req, res) => {
  try {
    const { title, content, date } = req.body;
    const newJournal = new Journal({ title, content, date });
    await newJournal.save();
    res.json(newJournal);
  } catch (err) {
    res.status(500).json({ error: 'Error creating journal' });
  }
});

// Delete a journal
app.delete('/journals/:id', async (req, res) => {
  try {
    await Journal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Journal deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting journal' });
  }
});

// Serve journal entries for a selected date
app.get('/journal_entries', async (req, res) => {
  const { date } = req.query;
  try {
    const entry = await Journal.findOne({ date });
    if (!entry) {
      return res.status(404).send('No journal entry found.');
    }
    res.send(entry.content);
  } catch (err) {
    res.status(500).send('Error fetching journal entry');
  }
});

// Add a new journal entry
app.post('/add_journal_entry', async (req, res) => {
  const { date, content } = req.body;
  try {
    const newEntry = new Journal({ date, content });
    await newEntry.save();
    res.json({ message: 'Journal entry added!' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding entry', error });
  }
});

// Save or update a journal entry
app.post('/save-entry', async (req, res) => {
  const { date, feeling, entry } = req.body;
  try {
    await Journal.findOneAndUpdate(
      { date: date },
      { feeling: feeling, entry: entry },
      { upsert: true, new: true }
    );
    res.status(200).send('Entry saved');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving entry');
  }
});

// Server Start
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
