window.MASTERS_SCOREBOARD_DATA = {
  event: {
    name: "2026 Sterling Grove Masters Invitational",
    dates: "April 10-12, 2026",
    status: "Final results",
    lastUpdated: "2026-04-12T18:00:00-07:00"
  },
  scoring: {
    teamPar: 144,
    proPar: 288,
    tournamentPar: 432,
    day1: {
      label: "Day 1 Shamble",
      par: 72,
      description: "Masters used one team shamble score on Day 1."
    },
    day2: {
      label: "Day 2 Best Ball",
      par: 72,
      description: "Masters used one team best-ball score on Day 2."
    }
  },
  calcutta: {
    pot: 6300,
    basis: "Sterling Grove team score only",
    payouts: [
      { place: 1, label: "1st", percent: 0.5, payout: 3150, team: "Team Sticks", owner: "Feutz" },
      { place: 2, label: "2nd", percent: 0.25, payout: 1575, team: "Team DeLaFunk", owner: "Royce" },
      { place: 3, label: "3rd", percent: 0.15, payout: 945, team: "Papa Becko And The Bomber", owner: "Bellows" },
      { place: 4, label: "4th", percent: 0.1, payout: 630, team: "Team Winning", owner: "DeLaveaga" }
    ]
  },
  proScores: [
    { name: "Scottie Scheffler", round3: 65, round4: 68, total: 133 },
    { name: "Russell Henley", round3: 66, round4: 68, total: 134 },
    { name: "Cameron Young", round3: 65, round4: 73, total: 138 },
    { name: "Jordan Spieth", round3: 70, round4: 68, total: 138 },
    { name: "Victor Hovland", round3: 71, round4: 67, total: 138 },
    { name: "Xander Schauffele", round3: 70, round4: 68, total: 138 },
    { name: "Justin Rose", round3: 69, round4: 70, total: 139 },
    { name: "Patrick Cantlay", round3: 66, round4: 73, total: 139 },
    { name: "John Rahm", round3: 73, round4: 68, total: 141 },
    { name: "Ludvig Åberg", round3: 69, round4: 72, total: 141 },
    { name: "Justin Thomas", round3: 71, round4: 73, total: 144 },
    { name: "Rory McIlroy", round3: 73, round4: 71, total: 144 },
    { name: "Patrick Reed", round3: 72, round4: 73, total: 145 },
    { name: "Wyndham Clark", round3: 72, round4: 73, total: 145 },
    { name: "Sungjae Im", round3: 69, round4: 77, total: 146 },
    { name: "Marco Penge", round3: 71, round4: 78, total: 149 }
  ],
  teams: [
    {
      flight: "Tiger",
      flightRank: "1",
      teamName: "Team DeLaFunk",
      players: ["Greg Funk", "Jeff De Laveaga"],
      teamHandicap: 5.1,
      scores: { day1: 67, day2: 64 },
      pros: {
        a: { name: "Cameron Young", round3: 65, round4: 73 },
        b: { name: "Russell Henley", round3: 66, round4: 68 }
      },
      total: 403,
      flightPayout: 1200,
      calcutta: { rank: "2", owner: "Royce", auctionPrice: 325, finalPlace: 2, payout: 1575 }
    },
    {
      flight: "Tiger",
      flightRank: "2",
      teamName: "Team Sticks",
      players: ["James Feutz", "Nate Adams"],
      teamHandicap: -6.4,
      scores: { day1: 64, day2: 66 },
      pros: {
        a: { name: "Scottie Scheffler", round3: 65, round4: 68 },
        b: { name: "John Rahm", round3: 73, round4: 68 }
      },
      total: 404,
      flightPayout: 500,
      calcutta: { rank: "1", owner: "Feutz", auctionPrice: 500, finalPlace: 1, payout: 3150 }
    },
    {
      flight: "Tiger",
      flightRank: "3",
      teamName: "Team Down The Middle",
      players: ["Kiernan Mattson", "Matt Pullen"],
      teamHandicap: 3.4,
      scores: { day1: 66, day2: 69 },
      pros: {
        a: { name: "Xander Schauffele", round3: 70, round4: 68 },
        b: { name: "Jordan Spieth", round3: 70, round4: 68 }
      },
      total: 411,
      flightPayout: 300,
      calcutta: { rank: "T-5", owner: "Restivo", auctionPrice: 500, payout: 0 }
    },
    {
      flight: "Tiger",
      flightRank: "4",
      teamName: "Team Winning",
      players: ["Christopher Royce", "Justin Deuker"],
      teamHandicap: 15.8,
      scores: { day1: 65, day2: 69 },
      pros: {
        a: { name: "Justin Rose", round3: 69, round4: 70 },
        b: { name: "John Rahm", round3: 73, round4: 68 }
      },
      total: 414,
      flightPayout: 0,
      calcutta: { rank: "4", owner: "DeLaveaga", auctionPrice: 450, finalPlace: 4, payout: 630 }
    },
    {
      flight: "Tiger",
      flightRank: "5",
      teamName: "Team Foot Wedge",
      players: ["Mike Muller", "Zane Eisenbarth"],
      teamHandicap: 12.5,
      scores: { day1: 69, day2: 73 },
      pros: {
        a: { name: "Scottie Scheffler", round3: 65, round4: 68 },
        b: { name: "John Rahm", round3: 73, round4: 68 }
      },
      total: 416,
      flightPayout: 0,
      calcutta: { rank: "19", owner: "Jon", auctionPrice: 350, payout: 0 }
    },
    {
      flight: "Tiger",
      flightRank: "6",
      teamName: "Team Vanilla Slice",
      players: ["Korey Jerome", "Travis Ingram"],
      teamHandicap: 16.3,
      scores: { day1: 69, day2: 66 },
      pros: {
        a: { name: "Patrick Reed", round3: 72, round4: 73 },
        b: { name: "Patrick Cantlay", round3: 66, round4: 73 }
      },
      total: 419,
      flightPayout: 0,
      calcutta: { rank: "T-5", owner: "Ingram", auctionPrice: 300, payout: 0 }
    },
    {
      flight: "Tiger",
      flightRank: "T-7",
      teamName: "Pink Lady",
      players: ["Eric Weiss", "Ron Marino"],
      teamHandicap: 7.2,
      scores: { day1: 64, day2: 72 },
      pros: {
        a: { name: "Patrick Reed", round3: 72, round4: 73 },
        b: { name: "Patrick Cantlay", round3: 66, round4: 73 }
      },
      total: 420,
      flightPayout: 0,
      calcutta: { rank: "T-7", owner: "Lewis", auctionPrice: 400, payout: 0 }
    },
    {
      flight: "Tiger",
      flightRank: "T-7",
      teamName: "Team Beard",
      players: ["Derek Becko", "Dusty Wasmund"],
      teamHandicap: 10.5,
      scores: { day1: 67, day2: 69 },
      pros: {
        a: { name: "Patrick Reed", round3: 72, round4: 73 },
        b: { name: "Patrick Cantlay", round3: 66, round4: 73 }
      },
      total: 420,
      flightPayout: 0,
      calcutta: { rank: "T-7", owner: "Dusty", auctionPrice: 275, payout: 0 }
    },
    {
      flight: "Tiger",
      flightRank: "T-9",
      teamName: "Team Timex",
      players: ["Jon Vrolyks", "Nick Rucci"],
      teamHandicap: 17.5,
      scores: { day1: 64, day2: 73 },
      pros: {
        a: { name: "Rory McIlroy", round3: 73, round4: 71 },
        b: { name: "John Rahm", round3: 73, round4: 68 }
      },
      total: 422,
      flightPayout: 0,
      calcutta: { rank: "T-10", owner: "Jon", auctionPrice: 425, payout: 0 }
    },
    {
      flight: "Tiger",
      flightRank: "T-9",
      teamName: "Team Low Expectations",
      players: ["Michael Falagrady", "Paul Benga"],
      teamHandicap: 12,
      scores: { day1: 70, day2: 67 },
      pros: {
        a: { name: "Rory McIlroy", round3: 73, round4: 71 },
        b: { name: "John Rahm", round3: 73, round4: 68 }
      },
      total: 422,
      flightPayout: 0,
      calcutta: { rank: "T-10", owner: "Lewis", auctionPrice: 400, payout: 0 }
    },
    {
      flight: "Rory",
      flightRank: "1",
      teamName: "Papa Becko And The Bomber",
      players: ["Joe Becko", "Scott Lucas"],
      teamHandicap: 21.9,
      scores: { day1: 65, day2: 68 },
      pros: {
        a: { name: "Scottie Scheffler", round3: 65, round4: 68 },
        b: { name: "Victor Hovland", round3: 71, round4: 67 }
      },
      total: 404,
      flightPayout: 1200,
      calcutta: { rank: "3", owner: "Bellows", auctionPrice: 375, finalPlace: 3, payout: 945 }
    },
    {
      flight: "Rory",
      flightRank: "T-2",
      teamName: "Team Docks To Docs",
      players: ["Larry Caplan", "Wayne Fellows"],
      teamHandicap: 28.1,
      scores: { day1: 74, day2: 66 },
      pros: {
        a: { name: "Scottie Scheffler", round3: 65, round4: 68 },
        b: { name: "John Rahm", round3: 73, round4: 68 }
      },
      total: 414,
      flightPayout: 500,
      note: "Won Rory Flight tiebreak for 2nd",
      calcutta: { rank: "16", owner: "Jarrett", auctionPrice: 250, payout: 0 }
    },
    {
      flight: "Rory",
      flightRank: "T-2",
      teamName: "Team 5 O'Clock Somewhere",
      players: ["Mark Lewis", "Patrick Schueppert"],
      teamHandicap: 25.8,
      scores: { day1: 71, day2: 72 },
      pros: {
        a: { name: "Scottie Scheffler", round3: 65, round4: 68 },
        b: { name: "Victor Hovland", round3: 71, round4: 67 }
      },
      total: 414,
      flightPayout: 300,
      note: "Lost Rory Flight tiebreak for 2nd",
      calcutta: { rank: "20", owner: "Restivo", auctionPrice: 300, payout: 0 }
    },
    {
      flight: "Rory",
      flightRank: "4",
      teamName: "Patty Ice And The Scrabble Rack",
      players: ["Mark Szostkiewicz", "Pat Jarrett"],
      teamHandicap: 19.3,
      scores: { day1: 68, day2: 71 },
      pros: {
        a: { name: "Justin Rose", round3: 69, round4: 70 },
        b: { name: "Jordan Spieth", round3: 70, round4: 68 }
      },
      total: 416,
      flightPayout: 0,
      calcutta: { rank: "15", owner: "Jarrett", auctionPrice: 175, payout: 0 }
    },
    {
      flight: "Rory",
      flightRank: "5",
      teamName: "Team Sand",
      players: ["Jim Restivo", "Steve Wilson"],
      teamHandicap: 25.5,
      scores: { day1: 69, day2: 69 },
      pros: {
        a: { name: "Ludvig Åberg", round3: 69, round4: 72 },
        b: { name: "Victor Hovland", round3: 71, round4: 67 }
      },
      total: 417,
      flightPayout: 0,
      calcutta: { rank: "T-13", owner: "Jon", auctionPrice: 250, payout: 0 }
    },
    {
      flight: "Rory",
      flightRank: "6",
      teamName: "Team Index",
      players: ["Kevin Barber", "Robert Hill"],
      teamHandicap: 36.6,
      scores: { day1: 69, day2: 67 },
      pros: {
        a: { name: "Cameron Young", round3: 65, round4: 73 },
        b: { name: "Marco Penge", round3: 71, round4: 78 }
      },
      total: 423,
      flightPayout: 0,
      calcutta: { rank: "T-7", owner: "Bellows", auctionPrice: 125, payout: 0 }
    },
    {
      flight: "Rory",
      flightRank: "7",
      teamName: "Team Rough Extractions",
      players: ["Kevin Mueller", "Trevor Bellows"],
      teamHandicap: 17.9,
      scores: { day1: 70, day2: 71 },
      pros: {
        a: { name: "Wyndham Clark", round3: 72, round4: 73 },
        b: { name: "Patrick Cantlay", round3: 66, round4: 73 }
      },
      total: 425,
      flightPayout: 0,
      calcutta: { rank: "T-17", owner: "Royce", auctionPrice: 275, payout: 0 }
    },
    {
      flight: "Rory",
      flightRank: "8",
      teamName: "Team Beat LA",
      players: ["Jeff Cloepfil", "Steve McCormick"],
      teamHandicap: 20.3,
      scores: { day1: 70, day2: 67 },
      pros: {
        a: { name: "Patrick Reed", round3: 72, round4: 73 },
        b: { name: "Justin Thomas", round3: 71, round4: 73 }
      },
      total: 426,
      flightPayout: 0,
      calcutta: { rank: "T-10", owner: "Jon", auctionPrice: 200, payout: 0 }
    },
    {
      flight: "Rory",
      flightRank: "9",
      teamName: "Team Island Time",
      players: ["JC Mason", "Shane Bolosan"],
      teamHandicap: 22.1,
      scores: { day1: 68, day2: 70 },
      pros: {
        a: { name: "Rory McIlroy", round3: 73, round4: 71 },
        b: { name: "Sungjae Im", round3: 69, round4: 77 }
      },
      total: 428,
      flightPayout: 0,
      calcutta: { rank: "T-13", owner: "Bolosan", auctionPrice: 200, payout: 0 }
    },
    {
      flight: "Rory",
      flightRank: "10",
      teamName: "Team 20",
      players: ["Brad Ackley", "Rob Oliver"],
      teamHandicap: 32,
      scores: { day1: 69, day2: 72 },
      pros: {
        a: { name: "Rory McIlroy", round3: 73, round4: 71 },
        b: { name: "Marco Penge", round3: 71, round4: 78 }
      },
      total: 434,
      flightPayout: 0,
      calcutta: { rank: "T-17", owner: "DeLaveaga", auctionPrice: 225, payout: 0 }
    }
  ]
};
