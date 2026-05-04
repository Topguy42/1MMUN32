import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "data", "3kh0-games.js");
const BASE = "https://lite.3kh0.net/";
const SRC =
	"https://raw.githubusercontent.com/3kh0/3kh0-lite/main/config/games.json";

const res = await fetch(SRC);
if (!res.ok) throw new Error(`fetch games.json: ${res.status}`);
const raw = await res.json();

const games = [];
const seen = new Set();
const folderRe = /^projects\/([^/]+)/;

raw.forEach((g, i) => {
	if (!g.link || !g.link.endsWith(".html")) return;
	if (!g.imgSrc || !g.title) return;
	const m = folderRe.exec(g.link);
	const folder = m ? m[1] : `game-${i}`;
	let id = folder
		.replace(/[^a-zA-Z0-9-]/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
		.toLowerCase();
	if (!id) id = `g-${i}`;
	let base = id;
	let n = 2;
	while (seen.has(id)) {
		id = `${base}-${n++}`;
	}
	seen.add(id);
	const linkPath = g.link.replace(/^\//, "");
	const imgPath = g.imgSrc.replace(/^\//, "");
	games.push({
		id,
		title: String(g.title).trim(),
		url: BASE + linkPath,
		image: BASE + imgPath,
		description: "via 3kh0 lite",
		proxy: true,
	});
});

const banner =
	`/* Built from https://github.com/3kh0/3kh0-lite (config/games.json). Games load from ${BASE} */\n`;
const body = `(function(){window.games=${JSON.stringify(games)};})();\n`;
fs.writeFileSync(OUT, banner + body);
console.log(`Wrote ${games.length} games to ${path.relative(ROOT, OUT)}`);
