(function () {
	const FRAME = Symbol.for("controller frame handle");

	function normalizeUrl(value) {
		const v = (value || "").trim();
		if (!v) return "";
		try {
			return new URL(v).toString();
		} catch {
			/* not absolute */
		}
		try {
			const u = new URL("https://" + v);
			if (u.hostname.includes(".")) return u.toString();
		} catch {
			/* ignore */
		}
		return "https://www.google.com/search?q=" + encodeURIComponent(v);
	}

	function loadScript(url) {
		return new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = url;
			script.onload = () => resolve();
			script.onerror = () => reject(new Error("Failed to load script " + url));
			document.head.appendChild(script);
		});
	}

	/** LibcurlClient requires ws:// or wss://, not a path. */
	function wispWebSocketUrl() {
		const proto = location.protocol === "https:" ? "wss:" : "ws:";
		return `${proto}//${location.host}/wisp/`;
	}

	function registerSw(path) {
		return navigator.serviceWorker
			.register(path, { type: "classic", updateViaCache: "none" })
			.then(async (registration) => {
				await navigator.serviceWorker.ready;
				if (registration.active) return registration.active;
				if (registration.installing) {
					await new Promise((resolve) => {
						const sw = registration.installing;
						if (sw.state === "activated") resolve();
						else {
							sw.addEventListener("statechange", function onChange() {
								if (sw.state === "activated") {
									sw.removeEventListener("statechange", onChange);
									resolve();
								}
							});
						}
					});
					return registration.active;
				}
				if (registration.waiting) {
					registration.waiting.postMessage({ type: "SKIP_WAITING" });
					await new Promise((resolve) => {
						navigator.serviceWorker.addEventListener(
							"controllerchange",
							resolve,
							{ once: true },
						);
					});
					return navigator.serviceWorker.controller;
				}
				throw new Error("No service worker found in registration");
			});
	}

	let initPromise;

	async function initController() {
		const sw = await registerSw("/sw.js");
		await loadScript("/scram/scramjet.js");
		await loadScript("/controller/controller.api.js");

		await loadScript("/clients/libcurl-client.js");
		const LibcurlCtor = window.LibcurlTransport.LibcurlClient;
		const transport = new LibcurlCtor({ wisp: wispWebSocketUrl() });

		const { Controller, config } = window.$scramjetController;
		config.injectPath = "/controller/controller.inject.js";
		config.wasmPath = "/scram/scramjet.wasm";
		config.scramjetPath = "/scram/scramjet.js";

		const controller = new Controller({ serviceworker: sw, transport });
		await controller.wait();
		return controller;
	}

	function getController() {
		if (!initPromise) initPromise = initController();
		return initPromise;
	}

	window.Tinf0ilProxy = {
		async encode(url) {
			return url;
		},
		async open(url) {
			const u = (url || "").trim();
			if (!u) return;
			const abs = normalizeUrl(u);
			const next = new URL("/load.html", location.origin);
			next.searchParams.set("url", abs);
			location.href = next.toString();
		},
		async frame(el, url) {
			if (!el || !url) return;
			const controller = await getController();
			let fr = el[FRAME];
			if (!fr) fr = controller.createFrame(el);
			fr.go(url);
		},
		async ready() {
			await getController();
		},
		async reset() {
			const regs = await navigator.serviceWorker.getRegistrations();
			await Promise.all(regs.map((r) => r.unregister()));
			location.reload();
		},
	};

	window.Tinf0il = window.Tinf0il || {};
	window.Tinf0il.normalizeUrl = normalizeUrl;
	window.Tinf0il.openBlank = function () {
		window.open("about:blank", "_blank");
	};
	window.Tinf0il.resetProxy = function () {
		window.Tinf0ilProxy.reset();
	};

	document.addEventListener("DOMContentLoaded", () => {
		getController().catch((err) => {
			console.error("[Scramjet] controller init failed:", err);
		});
	});
})();
