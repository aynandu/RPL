import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for images

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rpls2_db:rpls2%401015@rpls2.kek0jap.mongodb.net/?appName=rpls2';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Atlas Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Schemas

// 1. Matches Schema
const MatchSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Keeping numeric ID for frontend compatibility
    status: { type: String, default: 'upcoming' },
    date: Date,
    matchType: String, // Group Stage, Final, etc.
    team1: String,
    team2: String,
    stadium: String,
    oversChoosen: String,
    manOfTheMatch: String,
    tossResult: String,
    score: {
        team1: { runs: Number, wickets: Number, overs: Number, extras: Number },
        team2: { runs: Number, wickets: Number, overs: Number, extras: Number }
    },
    innings1Overs: Array, // Free-form array for complex nested objects
    innings2Overs: Array,
    batting: Array,
    bowling: Array,
    secondInningsBatting: Array,
    secondInningsBowling: Array,
    pointsProcessed: { type: Boolean, default: false },
    statsProcessed: { type: Boolean, default: false }
});
const Match = mongoose.model('Match', MatchSchema);

// 2. Teams (Points Table) Schema
const TeamSchema = new mongoose.Schema({
    team: { type: String, required: true, unique: true },
    played: { type: Number, default: 0 },
    won: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    tied: { type: Number, default: 0 },
    nrr: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    logo: String // Base64 or URL
});
const Team = mongoose.model('Team', TeamSchema);

// 3. Players Schema
const PlayerSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: String,
    team: String,
    role: String,
    image: String,
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    fifties: { type: Number, default: 0 },
    hundreds: { type: Number, default: 0 },
    overs: { type: Number, default: 0 }, // Store as total balls if preferred, but existing is numeric float
    maidens: { type: Number, default: 0 },
    runsConceded: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    bestBowling: String
});
const Player = mongoose.model('Player', PlayerSchema);

// 4. Settings Schema (Singleton)
const SettingsSchema = new mongoose.Schema({
    key: { type: String, default: 'global' }, // Use a fixed key to find it
    tournamentTitle: { name: String, season: String },
    stadiums: [String],
    oversOptions: [String],
    images: { type: Object, default: {} }, // carousel: [], etc.
    liveStreamUrl: String,
    liveStreamUrl2: String
});
const Settings = mongoose.model('Settings', SettingsSchema);


// API Routes

// Matches Routes
app.get('/api/matches', async (req, res) => {
    try {
        const matches = await Match.find().sort({ id: 1 });
        res.json(matches);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/matches', async (req, res) => {
    try {
        const newMatch = new Match(req.body);
        await newMatch.save();
        res.status(201).json(newMatch);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Update Match (PUT /id or /api/matches/:id)
// Frontend sends ID, not _id
app.put('/api/matches/:id', async (req, res) => {
    try {
        const updatedMatch = await Match.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updatedMatch);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/matches/:id', async (req, res) => {
    try {
        await Match.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// Teams Routes
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.find().sort({ points: -1 });
        res.json(teams);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/teams/batch', async (req, res) => { // For updatePointsTable
    try {
        // Full replace logic for points table is complex via API, 
        // usually we update specific teams. But context sends whole table.
        // We will perform bulkWrite upside
        const operations = req.body.map(team => ({
            updateOne: {
                filter: { team: team.team },
                update: { $set: team },
                upsert: true
            }
        }));
        if (operations.length > 0) {
            await Team.bulkWrite(operations);
        }
        const teams = await Team.find();
        res.json(teams);
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// Players Routes
app.get('/api/players', async (req, res) => {
    try {
        const players = await Player.find();
        res.json(players);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/players', async (req, res) => {
    try {
        const newPlayer = new Player(req.body);
        await newPlayer.save();
        res.status(201).json(newPlayer);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.put('/api/players/:id', async (req, res) => {
    try {
        const updated = await Player.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.post('/api/players/batch', async (req, res) => { // For batch stats updates
    try {
        const operations = req.body.map(p => ({
            updateOne: {
                filter: { id: p.id },
                update: { $set: p },
                upsert: true
            }
        }));
        if (operations.length > 0) {
            await Player.bulkWrite(operations);
        }
        res.json({ message: 'Batch updated' });
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/players/:id', async (req, res) => {
    try {
        await Player.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// Settings Routes
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne({ key: 'global' });
        if (!settings) {
            settings = new Settings({ key: 'global' });
            await settings.save();
        }
        res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/settings', async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate({ key: 'global' }, req.body, { new: true, upsert: true });
        res.json(settings);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Wipe Data
app.delete('/api/wipe', async (req, res) => {
    try {
        await Match.deleteMany({});
        await Team.deleteMany({});
        await Player.deleteMany({});
        // Keep settings generally, or wipe specific parts? 
        // User's 'resetData' function in context cleared everything.
        // Let's reset settings to defaults but keep key
        await Settings.findOneAndUpdate({ key: 'global' }, {
            tournamentTitle: { name: 'Revenue Premier League', season: 'S2' },
            stadiums: ['Indoor Stadium, Pramdom', 'Turf, Pathanamthitta'],
            oversOptions: ['6 Over', '8 Over', '10 Over'],
            liveStreamUrl: '',
            liveStreamUrl2: ''
        });

        res.json({ message: 'All data wiped' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
