// VARIABLES
const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const spotifyState = process.env.NEXT_PUBLIC_SPOTIFY_STATE;
const baseURI = "https://accounts.spotify.com";

// UTILS
export const getRedirectURI = () => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/dashboard`;
  }

  return "";
};

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
      `${baseURI}/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${getRedirectURI()}&state=${spotifyState}&show_dialog=true`
    );
  } catch (error) {
    console.log(error);
  }
};

export const textTruncate = (text, len) => {
  if (text.length < len) return text;

  return text.slice(0,len) + "..."
}
