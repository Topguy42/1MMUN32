// clientcommon.ts
async function registerSw(path) {
  const registration = await navigator.serviceWorker.register(path, {
    type: "classic",
    updateViaCache: "none"
  });
  await navigator.serviceWorker.ready;
  if (registration.active) {
    return registration.active;
  }
  if (registration.installing) {
    await new Promise((resolve) => {
      const sw = registration.installing;
      if (sw.state === "activated") {
        resolve();
      } else {
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
        () => {
          resolve();
        },
        { once: true }
      );
    });
    return navigator.serviceWorker.controller;
  }
  throw new Error("No service worker found in registration");
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

// client.ts
async function init(cfg) {
  const sw = await registerSw(cfg.swPath);
  loadRest(sw, cfg);
}
async function loadRest(sw, cfg) {
  await loadScript(cfg.scramjetBundlePath);
  await loadScript(cfg.scramjetControllerApiPath);
  let transport;
  if (cfg.transport === "epoxy") {
    await loadScript(cfg.epoxyClientPath);
    const EpoxyCtor = window.EpoxyTransport.EpoxyClient;
    transport = new EpoxyCtor({ wisp: cfg.wispPath });
  } else if (cfg.transport === "libcurl") {
    await loadScript(cfg.libcurlClientPath);
    const LibcurlCtor = window.LibcurlTransport.LibcurlClient;
    transport = new LibcurlCtor({ wisp: cfg.wispPath });
  } else if (cfg.transport === "bare") {
    throw new Error("Bare transport not implemented yet");
  }
  const { Controller, config } = window.$scramjetController;
  config.injectPath = cfg.scramjetControllerInjectPath;
  config.wasmPath = cfg.scramjetWasmPath;
  config.scramjetPath = cfg.scramjetBundlePath;
  const controller = new Controller({
    serviceworker: sw,
    transport
  });
  return controller;
}
export {
  init,
  loadRest
};
