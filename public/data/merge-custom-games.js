/* Append user-added games from localStorage (after /data/3kh0-games.js on load.html). */
(function mergeCustomGames() {
	try {
		const extra = JSON.parse(localStorage.getItem("customgames") || "[]");
		if (!Array.isArray(extra) || !extra.length) return;
		window.games = (window.games || []).concat(extra);
	} catch {
		/* ignore */
	}
})();
