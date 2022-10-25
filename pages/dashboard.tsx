import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useRouter } from "next/router";
import Head from "next/head";
import { Button, Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";
import { useAuth } from "../context/Auth";
import Nav from "../components/nav/Nav";
import CreateComboPlaylist from "../components/playlists/CreateComboPlaylist";
import ListOfComboPlaylists from "../components/playlists/ListOfComboPlaylists";
import RefreshOverlay from "../components/dashboard/RefreshOverlay";
import CommonHead from "../components/CommonHead";
import SpotifyLogo from "../components/SpotifyLogo";
import { getDifferenceInMins, spotifyLogin, getRedirectURI } from "../lib/utils";
import { addSpotifyAuth, updateSpotifyAuth } from "../redux/user";
import { fetchCombinedPlaylistsByUid } from "../redux/combinedPlaylist";
import { fetchSpotifyPlaylists } from "../redux/playlist";
import { fetchSpotifyMe } from "../redux/spotifyUser";

const Dashboard = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const redirectURI = getRedirectURI();
  const [timeoutId, setTimeoutId] = useState(null);
  const [refreshRequired, setRefreshRequired] = useState(false);
  const { user, spotifyUser, playlist, combinedPlaylist } = useAppSelector(
    (state) => state
  );

  const handleConnectSpotify = () => {
    spotifyLogin();
  };

  useEffect(() => {
    // if not authenticated, navigate to login
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // if router not ready, return
    if (!router.isReady) return;
    const code = router.query.code;
    const state = router.query.state;

    // if no userData, then return
    if (!user.isLoaded) return;

    // trigger if spotify has been authorized (code & state comes from Spotify)
    if (code && state) {
      dispatch(addSpotifyAuth({ uid: user.data.uid, code, state, redirectURI }));
      router.push("/dashboard");
      return;
    }

    // Access token needs to be refreshed every 60mins, so check last time it was updated
    const lastUpdateInMins = getDifferenceInMins(
      new Date(user.data.updatedAt),
      new Date()
    );

    // If updated over 60mins ago, then trigger a token refresh
    if (user.data.access_token && lastUpdateInMins > 60) {
      dispatch(
        updateSpotifyAuth({
          uid: user.data.uid,
          refresh_token: user.data.refresh_token,
          redirectURI,
        })
      );
      setRefreshRequired(false);
      router.push("/dashboard");
      return;
    }

    // if updated less than 60mins ago, put in a setTimeout call to ask user to refresh token
    if (user.data.access_token && lastUpdateInMins < 60) {
      if (timeoutId) clearTimeout(timeoutId);

      const timeToWaitInMs = (60 - lastUpdateInMins) * 60 * 1000;

      const id = setTimeout(() => {
        setRefreshRequired(true);
        setTimeoutId(null);
        return;
      }, timeToWaitInMs);

      setTimeoutId(id);
    }

    // This should be triggered if access token exists & has been alive for less than 60mins
    // If true, then get Spotify details for user & fetch their Spotify playlists
    if (user.data.access_token) {
      dispatch(fetchSpotifyMe({ access_token: user.data.access_token })).then(
        ({ payload }) => {
          dispatch(
            fetchSpotifyPlaylists({
              user: payload as string,
              access_token: user.data.access_token,
            })
          );

          // fetch their combined Playlists as well from DB
          dispatch(fetchCombinedPlaylistsByUid({ uid: user.data.uid }));
        }
      );
    }
  }, [isLoading, isAuthenticated, router.isReady, user.isLoaded, user.data]);

  const handleRefreshToken = () => {
    dispatch(
      updateSpotifyAuth({
        uid: user.data.uid,
        refresh_token: user.data.refresh_token,
        redirectURI,
      })
    );
    setRefreshRequired(false);
    router.push("/dashboard");
  };

  return (
    <>
      <CommonHead />
      <Head>
        <title key="title">Synchtify | Dashboard</title>
      </Head>

      <div className="vw-100 min-vh-100 h-100 d-flex flex-column align-items-center homepage-bg p-2 pt-5 text-text">
        <Nav />
        {!user.isLoaded && (
          <Spinner color="secondary" className="position-absolute top-50 start-50">
            Loading...
          </Spinner>
        )}
        {user.hasErrors && "Error: Please try refreshing"}
        {user.isLoaded && !user.hasErrors && !user.data.access_token && (
          <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column justify-content-center align-items-center overflow-hidden">
            <h1 className="text-text mb-3">Connect your Spotify Account to start</h1>
            <div className="d-flex justify-content-center">
              <Button
                color="secondary"
                className="btn-rounded d-flex gap-2 align-items-center fs-4 text-primary"
                onClick={handleConnectSpotify}
              >
                <FontAwesomeIcon icon={faSpotify} />
                Connect Spotify
              </Button>
            </div>
          </div>
        )}
        {user.isLoaded && !user.hasErrors && user.data.access_token && (
          <>
            {refreshRequired && (
              <RefreshOverlay handleRefreshToken={handleRefreshToken} />
            )}
            <div style={{minWidth: '50%'}}>
              {!spotifyUser.isLoaded &&
                !playlist.isLoaded &&
                !combinedPlaylist.isLoaded && (
                  <Spinner
                    color="secondary"
                    className="position-absolute top-50 start-50"
                  >
                    Loading...
                  </Spinner>
                )}
              {playlist.hasErrors && `Error: Please try refreshing`}
              {combinedPlaylist.hasErrors && `Error: Please try refreshing`}
              {playlist.isLoaded && !playlist.hasErrors && <CreateComboPlaylist />}

              {combinedPlaylist.isLoaded && !combinedPlaylist.hasErrors && (
                <>
                  <ListOfComboPlaylists combinedPlaylists={combinedPlaylist.data} />
                  <SpotifyLogo />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
