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

// User requested Playbook Images (Extracted from https://www.playbook.com/s/aynandu/rpl/)
export const INITIAL_IMAGES = [
    "https://img.playbook.com/afHeHrCSkB4ND1NbvIYdlYqsuQdumQOWMMuN8DM_kmA/w:4080/aHR0cHM6Ly9wcm9k/LnBsYXlib29rYXNz/ZXRzLmNvbS92MC8w/L3Byb2QvbGFyZ2Vf/cHJldmlld3MvOTg1/NjBlYzItOTU3ZS00/YmEzLTg3YzQtOGQ3/ZDY3MGQxNTg0P3R0/bD1ob3VybHkmdmVy/aWZ5PTE3Njg5OTY3/OTktZmdBMzRMa2JN/QmVudGdsWXR0TVl2/UWxJa096YVZYZXBz/TlZtTFJ0a1NIbyUz/RA.webp",
    "https://img.playbook.com/Zr-rrXik_1606iZtKNdNs_aggYKc9Yhk-iNvSDy0DB4/w:1599/aHR0cHM6Ly9wcm9k/LnBsYXlib29rYXNz/ZXRzLmNvbS92MC8w/L3Byb2QvbGFyZ2Vf/cHJldmlld3MvNmUy/ZDliMmEtMDk0Zi00/ZTQ0LThmZGYtZGMx/NWMxMmExNzJhP3R0/bD1ob3VybHkmdmVy/aWZ5PTE3Njg5OTY3/OTktYXBOSE9NU1Zw/emV5ZlFONWdWeFg0/dDdhSzE5RyUyQlVU/YW1JTXlxZmh3T0d3/JTNE.webp",
    "https://img.playbook.com/r_QXeQJIgFiJWbrl_CVnhJzCMYflgbgDjEicunR5o9w/w:1296/aHR0cHM6Ly9wcm9k/LnBsYXlib29rYXNz/ZXRzLmNvbS92MC8w/L3Byb2QvbGFyZ2Vf/cHJldmlld3MvZjFi/ZTFlNTgtNzM1Zi00/MGQ4LWE1NzAtZWNj/ZmM2YWM3MDdlP3R0/bD1ob3VybHkmdmVy/aWZ5PTE3Njg5OTY3/OTktZFh4JTJCcldX/Um1oTnVWQzNGVlh1/Ym5NMVpINk9USyUy/RiUyRjFNQUVieFFF/R3pNdyUzRA.webp",
    "https://img.playbook.com/4DklG40J-Jm-mXenMd2d3yrSbdpsKP_TIfH-QV8vUC0/w:1280/aHR0cHM6Ly9wcm9k/LnBsYXlib29rYXNz/ZXRzLmNvbS92MC8w/L3Byb2QvbGFyZ2Vf/cHJldmlld3MvYjY2/NmFjZGYtMmE3MS00/NWYxLWE0NjItNzE5/ZWM2NzVjZTQ3P3R0/bD1ob3VybHkmdmVy/aWZ5PTE3Njg5OTY3/OTktRkcwR0sybkFV/MVg0JTJCRWhpUTNm/bFdiN1d0SXJ4WUh1/dVIxbjFSaGwlMkZY/UmclM0Q.webp"
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
