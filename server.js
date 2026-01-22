
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster0.mongodb.net/rpl?retryWrites=true&w=majority')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// --- Mongoose Models ---

const matchSchema = new mongoose.Schema({
    id: Number,
    team1: String,
    team2: String,
    status: String,
    date: String,
    matchType: String,
    stadium: String,
    oversChoosen: String,
    tossResult: String,
    manOfTheMatch: String,
    score: {
        team1: { runs: Number, wickets: Number, overs: Number, extras: Number },
        team2: { runs: Number, wickets: Number, overs: Number, extras: Number }
    },
    batting: Array,
    bowling: Array,
    secondInningsBatting: Array,
    secondInningsBowling: Array,
    innings1Overs: Array,
    innings2Overs: Array
}, { strict: false });

const teamSchema = new mongoose.Schema({
    team: String,
    played: Number,
    won: Number,
    lost: Number,
    tied: Number,
    nrr: Number,
    points: Number,
    recent: Array
});

const playerSchema = new mongoose.Schema({
    id: Number,
    name: String,
    team: String,
    role: String,
    matches: Number,
    runs: Number,
    balls: Number,
    fours: Number,
    sixes: Number,
    fifties: Number,
    hundreds: Number,
    wickets: Number,
    overs: Number,
    maidens: Number,
    runsConceded: Number,
    highestScore: Number,
    bestBowling: String
}, { strict: false });

const settingsSchema = new mongoose.Schema({
    id: String, // 'global'
    tournamentTitle: Object,
    stadiums: [String],
    oversOptions: [String],
    liveStreamUrl: String,
    liveStreamUrl2: String,
    liveStreamUrl3: String,
    liveStreamUrl4: String,
    liveStreamUrl5: String,
    images: [String]
}, { strict: false });

const Match = mongoose.model('Match', matchSchema);
const Team = mongoose.model('Team', teamSchema);
const Player = mongoose.model('Player', playerSchema);
const Settings = mongoose.model('Settings', settingsSchema);

// --- Routes ---

// Matches
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
        res.json(newMatch);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/matches/:id', async (req, res) => {
    try {
        // Use findOneAndUpdate with upsert option to handle "create or update" logic if ID is custom
        // But here likely finding by the numeric 'id' field
        const updated = await Match.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, upsert: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/matches/:id', async (req, res) => {
    try {
        await Match.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Teams (Points Table)
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.find();
        res.json(teams);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/teams/batch', async (req, res) => {
    try {
        const teams = req.body;
        // Bulk write or loop update
        for (const t of teams) {
            await Team.findOneAndUpdate({ team: t.team }, t, { upsert: true });
        }
        res.json({ message: 'Teams updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/teams/:name', async (req, res) => {
    try {
        await Team.findOneAndDelete({ team: req.params.name });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Players
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
        res.json(newPlayer);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/players/:id', async (req, res) => {
    try {
        const updated = await Player.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/players/batch', async (req, res) => {
    try {
        const players = req.body;
        for (const p of players) {
            await Player.findOneAndUpdate({ id: p.id }, p, { upsert: true });
        }
        res.json({ message: 'Players updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/players/:id', async (req, res) => {
    try {
        await Player.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Settings
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne({ id: 'global' });
        if (!settings) {
            settings = new Settings({ id: 'global' });
            await settings.save();
        }
        res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/settings', async (req, res) => {
    try {
        const updated = await Settings.findOneAndUpdate({ id: 'global' }, req.body, { new: true, upsert: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Wipe Data
app.delete('/api/wipe', async (req, res) => {
    try {
        await Match.deleteMany({});
        await Team.deleteMany({});
        await Player.deleteMany({});
        // Reset settings but keep images? OR reset images too? 
        // Logic says reset images provided in context. Context sends new settings after this call.
        await Settings.findOneAndUpdate({ id: 'global' }, { liveStreamUrl: '', liveStreamUrl2: '' });
        res.json({ message: 'All data wiped' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Serve frontend in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
