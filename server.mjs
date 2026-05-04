import express from "express";
import http from "node:http";
import { bootstrap } from "./lib/bootstrap-server.js";

/** Default 8787 avoids common Apache/httpd on 8080. Override with PORT (no auto-fallback if set). */
const preferredPort = Number(process.env.PORT) || 8787;
const portLocked = Boolean(process.env.PORT);

const META_MAX_BYTES = 450_000;
const META_FETCH_MS = 10_000;

function decodeBasicEntities(s) {
	return s
		.replaceAll(/\s+/g, " ")
		.replaceAll(/&nbsp;/gi, " ")
		.replaceAll("&amp;", "&")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&quot;", '"')
		.replaceAll("&#39;", "'")
		.replaceAll(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
		.replaceAll(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(Number.parseInt(h, 16)))
		.trim();
}

function absolutize(href, baseUrl, docBase) {
	if (!href || href.startsWith("data:") || href.startsWith("javascript:")) return null;
	try {
		return new URL(href, docBase || baseUrl).href;
	} catch {
		return null;
	}
}

function googleFavicon(hostname) {
	return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
}

function parseTabMeta(html, finalUrl) {
	const pageUrl = new URL(finalUrl);
	const baseMatch = /<base[^>]+href\s*=\s*["']([^"']+)["']/i.exec(html);
	const docBase = baseMatch ? absolutize(baseMatch[1], pageUrl.href, pageUrl.href) : pageUrl.href;

	let title = "";
	const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
	if (titleMatch) title = decodeBasicEntities(titleMatch[1]).slice(0, 240);

	let iconHref = null;
	const linkRe = /<link\b[^>]*>/gi;
	let m;
	while ((m = linkRe.exec(html)) !== null) {
		const tag = m[0];
		const rel = /\brel\s*=\s*["']([^"']+)["']/i.exec(tag);
		if (!rel) continue;
		const r = rel[1].toLowerCase();
		if (!r.includes("icon") && r !== "shortcut icon" && !r.includes("apple-touch")) continue;
		const href = /\bhref\s*=\s*["']([^"']+)["']/i.exec(tag);
		if (!href) continue;
		const abs = absolutize(href[1], pageUrl.href, docBase);
		if (abs) {
			iconHref = abs;
			break;
		}
	}

	if (!iconHref) {
		iconHref = new URL("/favicon.ico", docBase).href;
	}

	const iconUrl = iconHref;
	const hostname = pageUrl.hostname;
	return {
		title: title || hostname,
		iconUrl,
		fallbackIconUrl: googleFavicon(hostname),
		hostname,
	};
}

const app = express();

app.get("/api/tab-meta", async (req, res) => {
	const raw = req.query.url;
	if (!raw || typeof raw !== "string") {
		res.status(400).json({ error: "missing url" });
		return;
	}
	let u;
	try {
		u = new URL(raw.trim());
	} catch {
		try {
			u = new URL(`https://${raw.trim()}`);
		} catch {
			res.status(400).json({ error: "invalid url" });
			return;
		}
	}
	if (u.protocol !== "http:" && u.protocol !== "https:") {
		res.status(400).json({ error: "only http(s) URLs" });
		return;
	}

	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), META_FETCH_MS);
	try {
		const r = await fetch(u.href, {
			redirect: "follow",
			signal: ctrl.signal,
			headers: {
				Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
				"User-Agent":
					"Mozilla/5.0 (compatible; Tinf0ilTabMeta/1.0; +https://github.com/)",
			},
		});
		clearTimeout(t);
		if (!r.ok) {
			res.status(502).json({ error: `site returned ${r.status}` });
			return;
		}
		const ct = r.headers.get("content-type") || "";
		if (!ct.includes("text/html") && !ct.includes("application/xhtml")) {
			res.status(200).json({
				title: u.hostname,
				iconUrl: googleFavicon(u.hostname),
				fallbackIconUrl: googleFavicon(u.hostname),
				hostname: u.hostname,
			});
			return;
		}
		const buf = await r.arrayBuffer();
		const slice = buf.byteLength > META_MAX_BYTES ? buf.slice(0, META_MAX_BYTES) : buf;
		const html = new TextDecoder("utf-8", { fatal: false }).decode(slice);
		const parsed = parseTabMeta(html, r.url || u.href);
		res.json(parsed);
	} catch (e) {
		clearTimeout(t);
		const msg = e?.name === "AbortError" ? "timeout" : "fetch failed";
		res.status(502).json({ error: msg });
	}
});

app.use(express.static("public", { fallthrough: true }));

const { routeRequest, routeUpgrade } = await bootstrap({
	transport: "libcurl",
});

const server = http.createServer((req, res) => {
	if (routeRequest(req, res)) return;
	app(req, res);
});

server.on("upgrade", routeUpgrade);

function listenOnce(srv, port) {
	return new Promise((resolve, reject) => {
		const onErr = (err) => {
			srv.off("error", onErr);
			reject(err);
		};
		srv.once("error", onErr);
		srv.listen(port, () => {
			srv.off("error", onErr);
			resolve(port);
		});
	});
}

let port = preferredPort;
const maxAttempts = portLocked ? 1 : 30;
let boundPort = null;

for (let attempt = 0; attempt < maxAttempts; attempt++) {
	try {
		boundPort = await listenOnce(server, port);
		break;
	} catch (err) {
		if (err.code === "EADDRINUSE" && !portLocked) {
			port++;
			continue;
		}
		if (err.code === "EADDRINUSE") {
			console.error(
				`Port ${preferredPort} is already in use (EADDRINUSE). Stop the other process or choose a different PORT.`,
			);
			console.error(
				`PowerShell: Get-NetTCPConnection -LocalPort ${preferredPort} | Select-Object OwningProcess`,
			);
			process.exit(1);
		}
		throw err;
	}
}

if (boundPort === null) {
	console.error(
		`Could not bind (${preferredPort}–${port - 1}): all attempts EADDRINUSE. Free a port or set PORT explicitly.`,
	);
	process.exit(1);
}

console.log(`Tinf0il UI + Scramjet: http://localhost:${boundPort}/`);
if (!portLocked && boundPort !== preferredPort) {
	console.log(`Note: preferred port ${preferredPort} was busy; using ${boundPort}.`);
}
