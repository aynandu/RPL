export const INITIAL_MATCHES = [
    {
        id: 1,
        team1: "Revenue Royals",
        team2: "Audit Avengers",
        status: "completed",
        date: "2024-03-10T14:30:00",
        score: {
            team1: { runs: 145, wickets: 4, overs: 20 },
            team2: { runs: 142, wickets: 8, overs: 20 },
        },
        batting: [
            { name: "John Doe", runs: 45, balls: 28, fours: 4, sixes: 2 },
            { name: "Jane Smith", runs: 12, balls: 10, fours: 1, sixes: 0 }
        ],
        bowling: [
            { name: "Mike Ross", overs: 4, runs: 28, wickets: 1 }
        ],
        secondInningsBatting: [
            { name: "Harvey Specter", runs: 70, balls: 45, fours: 8, sixes: 3, dismissalType: "notOut" },
            { name: "Louis Litt", runs: 12, balls: 15, fours: 1, sixes: 0, dismissalType: "caught", dismissalFielder: "John Doe", dismissalBowler: "Mike Ross" }
        ],
        secondInningsBowling: [
            { name: "Jessica Pearson", overs: 4, runs: 30, wickets: 2 }
        ],
        innings1Overs: [], // Will store [ { over: 1, balls: ["1", "4", "W", ...] } ]
        innings2Overs: [],
        history: []
    },
    {
        id: 2,
        team1: "Tax Titans",
        team2: "Finance Falcons",
        status: "live",
        date: "2024-03-11T10:00:00",
        score: {
            team1: { runs: 120, wickets: 2, overs: 14 },
            team2: { runs: 0, wickets: 0, overs: 0 },
        },
        batting: [
            { name: "Alice", runs: 60, balls: 40, fours: 6, sixes: 3 },
            { name: "Bob", runs: 30, balls: 24, fours: 2, sixes: 1 }
        ],
        bowling: null,
    },
    {
        id: 3,
        team1: "Ledger Legends",
        team2: "Balance Sheet Boys",
        status: "upcoming",
        date: "2024-03-12T18:00:00",
        score: {
            team1: { runs: 0, wickets: 0, overs: 0 },
            team2: { runs: 0, wickets: 0, overs: 0 },
        },
        batting: null,
        bowling: null,
    }
];

export const INITIAL_IMAGES = [
    "https://images.unsplash.com/photo-1531415074968-055db64351a6?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=1920&auto=format&fit=crop"
];

export const INITIAL_POINTS = [
    { team: "Revenue Royals", played: 1, won: 1, lost: 0, tied: 0, points: 2, nrr: 0.15 },
    { team: "Audit Avengers", played: 1, won: 0, lost: 1, tied: 0, points: 0, nrr: -0.15 },
    { team: "Tax Titans", played: 0, won: 0, lost: 0, tied: 0, points: 0, nrr: 0 },
    { team: "Finance Falcons", played: 0, won: 0, lost: 0, tied: 0, points: 0, nrr: 0 },
    { team: "Ledger Legends", played: 0, won: 0, lost: 0, tied: 0, points: 0, nrr: 0 },
    { team: "Balance Sheet Boys", played: 0, won: 0, lost: 0, tied: 0, points: 0, nrr: 0 },
];

export const ALL_TEAMS = [
    "Revenue Royals",
    "Audit Avengers",
    "Tax Titans",
    "Finance Falcons",
    "Ledger Legends",
    "Balance Sheet Boys"
];
