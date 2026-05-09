require("dotenv").config();
const PORT = process.env.PORT || 5000;
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors({
  origin: "https://game-ratings-app.vercel.app"
}));
app.use(express.json());

/* ================= MODELS ================= */

const GameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    genre: { type: String, default: "Unknown" },
    platform: { type: String, default: "Unknown" },
    company: { type: String, default: "Unknown" },
    link: String,
    image: String,
    ratings: { type: [Number], default: [] },
    comments: [
      {
        user: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const SuggestionSchema = new mongoose.Schema(
  {
    name: String,
    gameTitle: { type: String, required: true },
    message: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

const Game = mongoose.model("Game", GameSchema);
const Suggestion = mongoose.model("Suggestion", SuggestionSchema);

const ADMIN_KEY = process.env.ADMIN_KEY;

const verifyAdmin = (req, res, next) => {
  if (req.headers["admin-key"] !== ADMIN_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  next();
};
/* ---------------- GAME DATA (30 GAMES) ---------------- */

const seedGames = [
  {
    name: "Elden Ring",
    genre: "Action RPG",
    platform: "PC / PS / Xbox",
    company: "FromSoftware",
    link: "https://en.bandainamcoent.eu/elden-ring",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg"
  },
  {
    name: "GTA V",
    genre: "Action",
    platform: "PC / PS / Xbox",
    company: "Rockstar Games",
    link: "https://www.rockstargames.com/V",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg"
  },
  {
    name: "GTA IV",
    genre: "Action",
    platform: "PC / PS3 / Xbox",
    company: "Rockstar Games",
    link: "https://www.rockstargames.com/gtaiv",
    image: "https://upload.wikimedia.org/wikipedia/en/b/b7/Grand_Theft_Auto_IV_cover.jpg"
  },
  {
    name: "Red Dead Redemption 2",
    genre: "Action Adventure",
    platform: "PC / PS / Xbox",
    company: "Rockstar Games",
    link: "https://www.rockstargames.com/reddeadredemption2",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg"
  },
  {
    name: "Cyberpunk 2077",
    genre: "RPG",
    platform: "PC / PS / Xbox",
    company: "CD Projekt",
    link: "https://www.cyberpunk.net",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg"
  },
  {
    name: "God Of War",
    genre: "Action Adventure",
    platform: "PS / PC",
    company: "Santa Monica Studio",
    link: "https://www.playstation.com/en-us/games/god-of-war/",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/header.jpg"
  },
  {
    name: "Breath of the Wild",
    genre: "Adventure",
    platform: "Nintendo Switch",
    company: "Nintendo",
    link: "https://www.zelda.com/breath-of-the-wild/",
    image: "https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg"
  },
  {
    name: "The Last of Us Part I",
    genre: "Action Adventure",
    platform: "PS / PC",
    company: "Naughty Dog",
    link: "https://www.playstation.com/en-us/games/the-last-of-us-part-i/",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1888930/header.jpg"
  },
  {
    name: "The Last of Us Part II",
    genre: "Action Adventure",
    platform: "PS",
    company: "Naughty Dog",
    link: "https://www.playstation.com/en-us/games/the-last-of-us-part-ii/",
    image: "https://m.media-amazon.com/images/I/61emhw8-KTL._AC_UY327_FMwebp_QL65_.jpg"
  },
  {
    name: "Call Of Duty: Modern Warfare",
    genre: "Shooter",
    platform: "PC / PS / Xbox",
    company: "Activision",
    link: "https://www.callofduty.com/modernwarfare",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/2000950/header.jpg"
  },
  {
    name: "Assassin’s Creed II",
    genre: "Action",
    platform: "PC / PS / Xbox",
    company: "Ubisoft",
    link: "https://www.ubisoft.com/en-us/game/assassins-creed/assassins-creed-II",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/33230/header.jpg"
  },
  {
    name: "Spider-Man (PS4/PS5)",
    genre: "Action Adventure",
    platform: "PS / PC",
    company: "Insomniac Games",
    link: "https://store.playstation.com/en-us/product/UP9000-PPSA01467_00-MARVELSSPIDERMAN",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/header.jpg"
  },
  {
    name: "Resident Evil Village",
    genre: "Horror",
    platform: "PC / PS / Xbox",
    company: "Capcom",
    link: "https://www.residentevil.com/village/",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1196590/header.jpg"
  },
  {
    name: "Hitman Trilogy",
    genre: "Stealth",
    platform: "PC / PS / Xbox",
    company: "IO Interactive",
    link: "https://www.ioi.dk/hitman/",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1659040/header.jpg"
  },
  {
    name: "Ghost of Tsushima",
    genre: "Action Adventure",
    platform: "PS",
    company: "Sucker Punch",
    link: "https://www.playstation.com/en-us/games/ghost-of-tsushima/",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/2215430/header.jpg"
  },
  {
    name: "Fortnite",
    genre: "Battle Royale",
    platform: "All",
    company: "Epic Games",
    link: "https://www.fortnite.com/",
    image: "https://s.yimg.com/fz/api/res/1.2/KIHdQkb.CAQ_3qLJxlaGXQ--~C/YXBwaWQ9c3JjaGRkO2ZpPWZpbGw7aD0yNDA7cT0xMDA7dz0yNDA-/https://s.yimg.com/cv/apiv2/default/20211202/Fortnite.jpg"
  },
  {
    name: "Minecraft",
    genre: "Sandbox",
    platform: "PC",
    company: "Mojang",
    link: "https://www.minecraft.net",
    image: "https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/key-art/Homepage_Discover-our-games_MC-Vanilla-KeyArt_864x864.jpg"
  },
  {
    name: "Skyrim",
    genre: "RPG",
    platform: "PC / PS / Xbox",
    company: "Bethesda",
    link: "https://elderscrolls.bethesda.net/",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/489830/header.jpg"
  },
{
  name: "The Witcher 3: Wild Hunt",
  genre: "RPG",
  platform: "PC / PS / Xbox / Switch",
  company: "CD Projekt Red",
  link: "https://www.thewitcher.com/en/witcher3",
  image: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg"
},
{
  name: "GTA San Andreas",
  genre: "Action",
  platform: "PC / PS / Xbox",
  company: "Rockstar Games",
  link: "https://www.rockstargames.com/sanandreas",
  image: "https://cdn.cloudflare.steamstatic.com/steam/apps/12120/header.jpg"
},
{
  name: "Persona 5",
  genre: "JRPG",
  platform: "PS / PC",
  company: "Atlus",
  link: "https://atlus.com/persona5/",
  image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1687950/header.jpg"
},
{
  name: "Horizon Zero Dawn",
  genre: "Action RPG",
  platform: "PS / PC",
  company: "Guerrilla Games",
  link: "https://www.guerrilla-games.com/play/horizon",
  image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1151640/header.jpg"
},
{
  name: "Batman: Arkham City",
  genre: "Action",
  platform: "PC / PS / Xbox",
  company: "Rocksteady",
  link: "https://warnerbrosgames.com/game/batman-arkham-city",
  image: "https://cdn.cloudflare.steamstatic.com/steam/apps/200260/header.jpg"
},
{
  name: "Dark Souls III",
  genre: "Action RPG",
  platform: "PC / PS / Xbox",
  company: "FromSoftware",
  link: "https://www.bandainamcoent.com/games/dark-souls-iii",
  image: "https://cdn.cloudflare.steamstatic.com/steam/apps/374320/header.jpg"
},
{
  name: "Monster Hunter: World",
  genre: "Action RPG",
  platform: "PC / PS / Xbox",
  company: "Capcom",
  link: "https://www.monsterhunter.com/world/",
  image: "https://cdn.cloudflare.steamstatic.com/steam/apps/582010/header.jpg"
},
{
  name: "Divinity: Original Sin 2",
  genre: "RPG",
  platform: "PC / PS / Xbox",
  company: "Larian Studios",
  link: "https://divinity.game/",
  image: "https://cdn.cloudflare.steamstatic.com/steam/apps/435150/header.jpg"
},
{
  name: "Resident Evil 2",
  genre: "Horror",
  platform: "PC / PS / Xbox",
  company: "Capcom",
  link: "https://www.residentevil.com/2/uk/",
  image: "https://cdn.cloudflare.steamstatic.com/steam/apps/883710/header.jpg"
},
{
  name: "Resident Evil 3: Nemesis",
  genre: "Horror",
  platform: "PC / PS / Xbox",
  company: "Capcom",
  link: "https://www.residentevil.com/re3/",
  image: "https://cdn.cloudflare.steamstatic.com/steam/apps/952060/header.jpg"
},
{
  name: "Resident Evil 7: Biohazard",
  genre: "Horror",
  platform: "PC / PS / Xbox",
  company: "Capcom",
  link: "https://www.residentevil.com/7/",
  image: "https://cdn.cloudflare.steamstatic.com/steam/apps/418370/header.jpg"
},
{
  name: "Final Fantasy XIV",
  genre: "MMORPG",
  platform: "PC / PS",
  company: "Square Enix",
  link: "https://www.finalfantasyxiv.com/",
  image: "https://cdn.cloudflare.steamstatic.com/steam/apps/39210/header.jpg"
},
{
  name: "Resident Evil Requiem",
  genre: "Horror",
  platform: "PC / PS / Xbox",
  company: "Capcom",
  link: "https://www.residentevil.com/requiem/en-us/",
  image: "https://s.yimg.com/zb/imgv1/ecd9429b-f2ef-3097-a1e9-d20c6284dfaa/t_500x300"
},
{
  name: "EA Sports FC 24",
  genre: "Sports",
  platform: "PC / PS / Xbox",
  company: "EA Sports",
  link: "https://www.ea.com/games/ea-sports-fc",
  image: "https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/header.jpg"
}
];

/* ================= ROUTES ================= */

// GET games
app.get("/games", async (req, res) => {
  const games = await Game.find().sort({ createdAt: -1 });
  res.json(games);
});

// ADD game
app.post("/games", verifyAdmin, async (req, res) => {
  const game = await Game.create(req.body);
  res.json(game);
});

// DELETE game
app.delete("/games/:id", verifyAdmin, async (req, res) => {
  await Game.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// RATE
app.post("/games/:id/rate", async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) return res.status(404).json({ error: "Not found" });

  game.ratings.push(req.body.rating);
  await game.save();

  res.json(game);
});

// COMMENT
app.post("/games/:id/comment", async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) return res.status(404).json({ error: "Not found" });

  game.comments.push(req.body);
  await game.save();

  res.json(game);
});

/* ================= SUGGESTIONS ================= */

app.post("/suggestions", async (req, res) => {
  const s = await Suggestion.create(req.body);
  res.json(s);
});

app.get("/suggestions", verifyAdmin, async (req, res) => {
  const s = await Suggestion.find().sort({ createdAt: -1 });
  res.json(s);
});

/* =================================================
   🌱 DATABASE + SERVER START (FIXED VERSION)
================================================= */

const MONGO_URI = process.env.MONGO_URI;

async function startServer() {
  try {
    // 1. Connect DB
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // 2. Seed database only once
    const count = await Game.countDocuments();

    if (count === 0) {
      await Game.insertMany(seedGames);
      console.log("🎮 Seeded games");
    }

    // 3. Start server AFTER DB is ready
    app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

  } catch (err) {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  }
}

startServer();