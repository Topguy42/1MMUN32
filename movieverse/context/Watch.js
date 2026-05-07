'use client';

import { getEpisodes } from '@/lib/TVfunctions';
import { saveWatchProgress } from '@/utils/ProgressHandler';
import { useSearchParams } from 'next/navigation';
import { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';

export const WatchAreaContext = createContext(null);

export function WatchAreaContextProvider({ children, MovieInfo, MovieId }) {
  const searchparam = useSearchParams();

  const [episode, setEpisode] = useState(() => parseInt(searchparam.get('ep')) || 1);
  const [season, setSeason] = useState(() => parseInt(searchparam.get('se')) || 1);
  const [episodes, setEpisodes] = useState([]);
  const [episodeLoading, setEpisodeLoading] = useState(true);
  const [watchInfo, setWatchInfo] = useState({ loading: true });


  // ---------------- SYNC WITH SEARCH PARAMS ----------------
  useEffect(() => {
    const ep = parseInt(searchparam.get('ep')) || 1;
    const se = parseInt(searchparam.get('se')) || 1;

    setEpisode(ep);
    setSeason(se);
  }, [searchparam]);


  // ---------------- FETCH EPISODES ----------------
  useEffect(() => {
    if (!MovieInfo) return;

    setEpisodeLoading(true);

    if (MovieInfo.type !== 'tv') {
      const movieEpisode = [{
        episode_number: 1,
        name: MovieInfo.title,
        overview: MovieInfo.overview,
        runtime: MovieInfo.runtime || 90,
        season_number: 1,
        still_path: MovieInfo.backdrop_path,
      }];

      setEpisodes(movieEpisode);
      setEpisodeLoading(false);
      return;
    }

    const fetchEpisodes = async () => {
      try {
        const data = await getEpisodes(MovieId, season);
        if (!data?.episodes?.length) {
          toast('No episodes found');
          setEpisodes([]);
        } else {
          setEpisodes(data.episodes);
        }
      } catch (err) {
        console.error(err);
        toast('Failed to fetch episodes');
      } finally {
        setEpisodeLoading(false);
      }
    };

    fetchEpisodes();
  }, [MovieInfo, MovieId, season]);


  // ---------------- SAVE PROGRESS ----------------
  useEffect(() => {
    if (episodes.length && MovieInfo) {
      saveWatchProgress(MovieInfo, episodes, episode, season);
    }
  }, [episode, season, episodes, MovieInfo]);

  // ---------------- CONTEXT VALUE ----------------
  const contextValue = useMemo(() => ({
    episode,
    setEpisode,
    season,
    setSeason,
    episodes,
    watchInfo,
    setWatchInfo,
    episodeLoading,
    MovieInfo,
    MovieId,
  }), [
    episode,
    season,
    episodes,
    watchInfo,
    episodeLoading,
    MovieInfo,
    MovieId,
  ]);

  return (
    <WatchAreaContext.Provider value={contextValue}>
      {children}
    </WatchAreaContext.Provider>
  );
}

export function useWatchContext() {
  const ctx = useContext(WatchAreaContext);
  if (!ctx) throw new Error('useWatchContext must be used inside WatchAreaContextProvider');
  return ctx;
}
