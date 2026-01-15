export const INITIAL_MATCHES = [
    {
        id: 1,
        team1: "Revenue Royals",
        team2: "Audit Avengers",
        status: "completed",
        date: "2024-03-10T14:30:00",
        oversChoosen: "20 Over",
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
        oversChoosen: "20 Over",
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

// Using Raw GitHub User Content links
export const INITIAL_IMAGES = [
    "https://raw.githubusercontent.com/aynandu/RPL/ec6cb4a722704452f8327e6a31b78c23955881ae/public/images/carousel1.jpeg",
    "https://raw.githubusercontent.com/aynandu/RPL/ec6cb4a722704452f8327e6a31b78c23955881ae/public/images/carousel2.jpeg",
    "https://raw.githubusercontent.com/aynandu/RPL/ec6cb4a722704452f8327e6a31b78c23955881ae/public/images/carousel3.jpeg"
];

export const INITIAL_POINTS = [];

export const ALL_TEAMS = [
    "Revenue Royals",
    "Audit Avengers",
    "Tax Titans",
    "Finance Falcons",
    "Ledger Legends",
    "Balance Sheet Boys"
];
