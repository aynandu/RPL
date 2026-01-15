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

// User requested Playbook Images
export const INITIAL_IMAGES = [
    "https://img.playbook.com/LePkDfZrkRqIF9GD6CC7l_e3YfOPCbqWeS_aIl-XtDc/w:1000/aHR0cHM6Ly9wcm9k/LnBsYXlib29rYXNz/ZXRzLmNvbS92MC8w/L3Byb2QvbGFyZ2Vf/cHJldmlld3MvOTg1/NjBlYzItOTU3ZS00/YmEzLTg3YzQtOGQ3/ZDY3MGQxNTg0P3R0/bD1ob3VybHkmdmVy/aWZ5PTE3Njg1MTQz/OTktMmJCbDBXT045/YXd3bkw4SSUyQlgw/VXFCWXhtdkh2elph/TkxjWEs4dHVsYXBV/JTNE.webp",
    "https://img.playbook.com/7G4jKWL8GMKjlsa5mdh9N2yp1kLjRgDWllryevWHxoA/w:1200/aHR0cHM6Ly9wcm9k/LnBsYXlib29rYXNz/ZXRzLmNvbS92MC8w/L3Byb2QvbGFyZ2Vf/cHJldmlld3MvZjFi/ZTFlNTgtNzM1Zi00/MGQ4LWE1NzAtZWNj/ZmM2YWM3MDdlP3R0/bD1ob3VybHkmdmVy/aWZ5PTE3Njg1MTQz/OTktQUp5blZjRW95/bGF1WDB3NTZKc2I0/aXRqbzlxa0pFbkJq/dHI4YVZoV3ZaRSUz/RA.webp",
    "https://img.playbook.com/0tePWaIH08DCHVpcewrTHX8M4lNx5RP4wP2Q2UBiaEA/w:1000/aHR0cHM6Ly9wcm9k/LnBsYXlib29rYXNz/ZXRzLmNvbS92MC8w/L3Byb2QvbGFyZ2Vf/cHJldmlld3MvYjY2/NmFjZGYtMmE3MS00/NWYxLWE0NjItNzE5/ZWM2NzVjZTQ3P3R0/bD1ob3VybHkmdmVy/aWZ5PTE3Njg1MTQz/OTktRHVHdFdDUmdT/OHdxQlYlMkZlNm4w/UkVLSnJoZHU0WUZj/MktJckU1ZVlEUmVV/JTNE.webp",
    "https://img.playbook.com/3u23-QTRpMtCr0euec_aGi3VhnC-2kM-AZ7deS5g5Co/w:1200/aHR0cHM6Ly9wcm9k/LnBsYXlib29rYXNz/ZXRzLmNvbS92MC8w/L3Byb2QvbGFyZ2Vf/cHJldmlld3MvNmUy/ZDliMmEtMDk0Zi00/ZTQ0LThmZGYtZGMx/NWMxMmExNzJhP3R0/bD1ob3VybHkmdmVy/aWZ5PTE3Njg1MTQz/OTktazl0azZDQkw4/RVNTcWFTZUczYWpI/Z1F1NWppaE0lMkZl/YlAlMkJraFl3JTJG/VE85byUzRA.webp"
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
