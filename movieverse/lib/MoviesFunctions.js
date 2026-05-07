// Trending Movies
export const getTrendingMovies = async (type = "all", page = 1) => {
  const url = `https://api.themoviedb.org/3/trending/${(type === "movies" ? "movie" : type) || "all"}/day?language=en-US&page=${page}&api_key=${process.env.TMDB_API_KEY}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 * 24 } });

    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

// Popular Movies
export const getPopularMovies = async (page) => {
  const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}&api_key=38248c047fd8ef9b0a7e25d40651e870`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 * 24 } });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Error: ${res.status} - ${errorBody}`);
    }


    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

// Top Rated Movies
export const getTopRatedMovies = async () => {
  const url = `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1&api_key=${process.env.TMDB_API_KEY}`;

  try {
    const res = await fetch(url,
      { next: { revalidate: 864000 } }
    );

    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};


// Top TV / MOVIES INFO
export const getInfoTMDB = async (TMDBID, media_type) => {
  const validMediaTypes = ["movie", "tv"];
  if (!validMediaTypes.includes(media_type)) {
    return "media_type_error";
  }

  const baseUrl = "https://api.themoviedb.org/3";
  const url =
    media_type === "movie"
      ? `${baseUrl}/movie/${TMDBID}?language=en-US&api_key=${process.env.TMDB_API_KEY}&t=${Date.now()}`
      : `${baseUrl}/tv/${TMDBID}?language=en-US&api_key=${process.env.TMDB_API_KEY}&t=${Date.now()}`;

  const maxRetries = 5;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const res = await fetch(url, { cache: "no-store" });

      if (res.status === 404) {
        return "media_type_error";
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      data.type = media_type;
      return data;

    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed:`, error.message);

      if (attempts >= maxRetries) {
        return null;
      }

      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return null;
};








// GET TV / MOVIES RECOMMENDATION
export const getRecommendation = async (TMDBID, Type) => {
  const url = `https://api.themoviedb.org/3/${Type || "movie"}/${TMDBID}/recommendations?&api_key=${process.env.TMDB_API_KEY}`;

  try {
    const res = await fetch(url,
      { next: { revalidate: 21600 } }
    );

    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }

    const data = await res.json();

    if (data?.results?.length <= 5) {
      const data = getTrendingMovies()

      return data;
    }

    return data;
  } catch (error) {
    console.error(error);
  }
};

// GET MOVIE / TV REVIEWS (with pagination)
export const getReviews = async (TMDBID, Type, page = 1) => {
  const url = `https://api.themoviedb.org/3/${Type || "movie"}/${TMDBID}/reviews?language=en-US&page=${page}&api_key=${process.env.TMDB_API_KEY}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 21600 }, // cache for 6 hours
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }

    const data = await res.json();

    // If no reviews, return safe structure
    if (!data?.results || data.results.length === 0) {
      return {
        results: [],
        total_pages: 1,
        total_results: 0,
      };
    }

    return data;

  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return {
      results: [],
      total_pages: 1,
      total_results: 0,
    };
  }
};
