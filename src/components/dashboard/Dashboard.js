import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";
import Nav from "components/nav/Nav";
import CreateComboPlaylist from "components/playlists/CreateComboPlaylist";
import ListOfComboPlaylists from "components/playlists/ListOfComboPlaylists";
import { getDifferenceInMins, spotifyLogin } from "utils/utils";
import { addSpotifyAuth, updateSpotifyAuth } from "redux/user";
import { fetchCombinedPlaylistsByUid } from "redux/combinedPlaylist";
import { fetchSpotifyPlaylists } from "redux/playlist";
import { fetchSpotifyMe } from "redux/spotifyUser";
import RefreshOverlay from "./RefreshOverlay";

const Dashboard = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const redirectURI = `${window.location.origin}/dashboard`;
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const [timeoutId, setTimeoutId] = useState();
  const [refreshRequired, setRefreshRequired] = useState(false);
  const {
    user, spotifyUser, playlist, combinedPlaylist
  } = useSelector((state) => state);

  const handleConnectSpotify = () => {
    spotifyLogin();
  };

  useEffect(() => {
    // if no userData, then return
    if (!user.isLoaded) return;

    // trigger if spotify has been authorized (code & state comes from Spotify)
    if (code && state) {
      dispatch(addSpotifyAuth({ uid: user.data.uid, code, state, redirectURI }));
      navigate("/dashboard");
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
      navigate("/dashboard");
      return;
    }

    // if updated less than 60mins ago, put in a setTimeout call to ask user to refresh token
    if (user.data.access_token && lastUpdateInMins < 60) {
      if (timeoutId) clearTimeout(timeoutId);

      const timeToWaitInMs = (60 - lastUpdateInMins) * 60 * 1000;

      const id = setTimeout(() => {
        setRefreshRequired(true);
        setTimeoutId();
        return;
      }, timeToWaitInMs);

      setTimeoutId(id);
    }

    // This should be triggered if access token exists & has been alive for less than 60mins
    // If true, then get Spotify details for user & fetch their Spotify playlists
    if (user.data.access_token) {
      dispatch(fetchSpotifyMe({ access_token: user.data.access_token })).then(
        (data) => {
          dispatch(
            fetchSpotifyPlaylists({
              user: data.payload,
              access_token: user.data.access_token,
            })
          );

          // fetch their combined Playlists as well from DB
          dispatch(fetchCombinedPlaylistsByUid({ uid: user.data.uid }));
        }
      );
    }
  }, [user.isLoaded, user.data]);

  const handleRefreshToken = () => {
    dispatch(
      updateSpotifyAuth({
        uid: user.data.uid,
        refresh_token: user.data.refresh_token,
        redirectURI,
      })
    );
    setRefreshRequired(false);
    navigate("/dashboard");
  };

  return (
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
          <div>
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
              <ListOfComboPlaylists combinedPlaylists={combinedPlaylist.data} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
