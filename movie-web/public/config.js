window.__CONFIG__ = {
  // The URL for the CORS proxy, the URL must NOT end with a slash!
  // If not specified, the onboarding will not allow a "default setup". The user will have to use the extension or set up a proxy themselves
  VITE_CORS_PROXY_URL: "http://localhost:8787/api/tv-proxy",

  // The READ API key to access TMDB
  VITE_TMDB_READ_API_KEY: "7f07bff404ee5ba865c936f48d41327a",

  // The DMCA email displayed in the footer, null to hide the DMCA link
  VITE_DMCA_EMAIL: null,

  // Whether to disable hash-based routing, leave this as false if you don't know what this is
  VITE_NORMAL_ROUTER: false,

  // The backend URL to communicate with
  VITE_BACKEND_URL: null,

  // A comma separated list of disallowed IDs in the case of a DMCA claim - in the format "series-<id>" and "movie-<id>"
  VITE_DISALLOWED_IDS: "",

  // Comma separated provider/source IDs that have been verified to exist and return playable content from this network.
  // Leave empty to avoid checking blocked, dead, or unverified archive sources.
  VITE_ENABLED_PROVIDER_IDS: "",

  // Comma separated embed IDs used by the enabled providers.
  VITE_ENABLED_EMBED_IDS: "",

  // Keep the archive app directly usable inside tinf0il without setup screens
  VITE_HAS_ONBOARDING: false
};
