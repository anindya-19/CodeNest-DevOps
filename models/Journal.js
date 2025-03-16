const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    title: String,
    content: String,
    date: { type: String, required: true } // Ensure date is stored as String (e.g., "2025-03-01")
}, { timestamps: true }); // This adds createdAt and updatedAt fields automatically

module.exports = mongoose.model('Journal', journalSchema);
