/* Games from /data/3kh0-games.js (+ customgames); apps from /data/apps.js (+ customapps). */

(function mergeCustomGames() {
	try {
		const extra = JSON.parse(localStorage.getItem("customgames") || "[]");
		if (!Array.isArray(extra) || !extra.length) return;
		window.games = (window.games || []).concat(extra);
	} catch {
		/* ignore */
	}
})();

/** First matching rule wins; custom / unknown games → arcade */
const GAME_TAG_RULES = [
	{ tag: "rhythm", re: /geodash|geometry dash|hextris/i },
	{
		tag: "puzzle",
		re: /2048|wordle|bloxor|connect ?3|factory ball|impossible|there is no game|this is the only|doge|meme|cupcake|deal or no deal|sort the court|circl|btts|big tower tiny|cell machine|cannon basketball|draw the hill|push the square|push your luck|glass city|edge not|elastic|game inside|creative kill|unblock|polybranch|9007199254740992/i,
	},
	{
		tag: "idle",
		re: /idle|clicker|grind craft|grindcraft|particle|hackertype|dogeminer|csgo clicker|cookie clicker|idle shark/i,
	},
	{
		tag: "sim",
		re: /papa'?s|pandemic|learn to fly|interactive buddy|you are jeff|bezos|tycoon|factory balls forever/i,
	},
	{
		tag: "sandbox",
		re: /minecraft|eagler|precision client|sand game|webretro|craftmine|n-gon\b/i,
	},
	{ tag: "io", re: /krunker|paper\.?io|1v1\.space|smash.*kart|snowbattle/i },
	{ tag: "social", re: /among us|tube jumper/i },
	{ tag: "sports", re: /basketball|retro bowl|miniputt|soccer|golf|baseball/i },
	{
		tag: "strategy",
		re: /bloons|hex empire|stick war|stickwar|canyon defense|storm the house|tower defense|defend the/i,
	},
	{
		tag: "shooter",
		re: /shoot|csgo|tank|tactical|superhot|rooftop sniper|missiles|soldier|matrix rampage|endless war|box head|smoking barrel|helicopter|battle for|champion archer|getaway shootout|evil glitch|wolfenstein|wolf3d/i,
	},
	{
		tag: "classic",
		re: /tetris|minesweeper|solitaire|chrome dino|flappy|google snake|pacman|double wires|kitten cannon|toss the turtle|tv static|flash tetris|portal \(flash\)|portalflash/i,
	},
	{
		tag: "racing",
		re: /slope|tunnel rush|tanuki|motox|death run|cubefield|rolly|swerve|traffic|hexgl|temple run|subway surf|doodle jump|ns-shaft|jetpack|stack bump/i,
	},
	{
		tag: "platformer",
		re: /mario|super mario|sm64|vex|duck life|om nom|stealing the|breaking the|world'?s hardest|henry|only level|just one boss|fireboy|watergirl|ovo|ovo2|red ball|geometry lite|minecraft classic\b/i,
	},
];

function inferGameTag(entry) {
	const hay = `${entry.title}\n${entry.id}`.toLowerCase();
	for (const { tag, re } of GAME_TAG_RULES) {
		if (re.test(hay)) return tag;
	}
	return "arcade";
}

window.GAMES = (window.games || []).map((g) => ({
	id: g.id,
	title: g.title,
	tag: inferGameTag(g),
	image: g.image || "",
}));

const APP_TAG = {
	google: "search",
	discord: "social",
	geforce: "cloud",
	vscode: "tools",
	tiktok: "social",
	nowgg: "cloud",
	reddit: "social",
	youtube: "video",
	twitter: "social",
	spotify: "audio",
	chess: "tools",
	movieweb: "video",
	coolmathgames: "tools",
	win11: "tools",
	gbaemulator: "tools",
	snapchat: "social",
	twitch: "video",
};

function appImageUrl(img) {
	if (!img) return "";
	const s = String(img).trim();
	if (/^https?:\/\//i.test(s)) return s;
	return s.startsWith("/") ? s : `/${s}`;
}

window.APPS = (window.apps || [])
	.filter((a) => a && a.id && a.id !== "customapp")
	.map((a) => ({
		id: a.id,
		title: a.title,
		tag: APP_TAG[a.id] || "tools",
		image: appImageUrl(a.image),
	}));

window.GAME_TAGS = [
	"all",
	"arcade",
	"puzzle",
	"idle",
	"sim",
	"rhythm",
	"classic",
	"platformer",
	"racing",
	"shooter",
	"sports",
	"strategy",
	"sandbox",
	"io",
	"social",
];
window.APP_TAGS = ["all", "search", "social", "video", "tools", "cloud", "audio"];
