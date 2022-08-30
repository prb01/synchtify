// VARIABLES
const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const spotifyState = process.env.REACT_APP_SPOTIFY_STATE;
const baseURI = "https://accounts.spotify.com";
const redirectURI = `${window.location.origin}/dashboard`;

// UTILS
export const getDifferenceInMins = (fromDate, toDate) => {
  const diff = Math.floor((toDate - fromDate) / (1000 * 60));
  console.log(diff);
  return diff;
};

export const spotifyLogin = () => {
  try {
    const scope = [
      "playlist-read-collaborative",
      "playlist-modify-public",
      "playlist-read-private",
      "playlist-modify-private",
    ].join(" ");

    window.location.replace(
      `${baseURI}/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectURI}&state=${spotifyState}&show_dialog=true`
    );
  } catch (error) {
    console.log(error);
  }
};