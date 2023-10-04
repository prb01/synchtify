// import firebase from "firebase/app";
import firebase from "../lib/firebase";
require("firebase/functions");
firebase.functions().useEmulator("localhost", 5001);

async function cloudAPICall(cloudFunction, payload) {
  try {
    const _functionCall = firebase.functions().httpsCallable(cloudFunction);
    const { data } = await _functionCall(payload);
    return data;
  } catch (error) {
    console.log(JSON.stringify(error));
  }
}

async function getAccessToken(code, state, redirectURI) {
  return cloudAPICall("getAccessToken", { code, state, redirectURI });
}

async function getRefreshedAccessToken(refreshToken, redirectURI) {
  return cloudAPICall("getRefreshedAccessToken", { refreshToken, redirectURI });
}

async function getMe(access_token) {
  return cloudAPICall("getMeV2", { access_token });
}

async function getAllPlaylists(user, access_token) {
  return cloudAPICall("getAllPlaylists", { user, access_token });
}

async function getPlaylist(playlist_id, access_token) {
  return cloudAPICall("getPlaylist", { playlist_id, access_token });
}

async function getAllSongsFromPlaylist(playlist_id, access_token) {
  return cloudAPICall("getAllSongsFromPlaylist", { playlist_id, access_token });
}

async function deleteSongsFromPlaylist(playlist_id, access_token, tracks) {
  return cloudAPICall("deleteSongsFromPlaylist", {
    playlist_id,
    access_token,
    tracks,
  });
}

async function unfollowPlaylist(playlist_id, access_token) {
  return cloudAPICall("unfollowPlaylist", { playlist_id, access_token });
}

async function createPlaylist(
  user_id,
  access_token,
  name,
  description = "Combined playlist made with Synchtify (synchtify.prb01.com)"
) {
  return cloudAPICall("createPlaylist", {
    user_id,
    access_token,
    name,
    description,
  });
}

async function addSongsToPlaylist(playlist_id, access_token, uris) {
  return cloudAPICall("addSongsToPlaylist", { playlist_id, access_token, uris });
}

async function adminRefreshAllCombinedPlaylists() {
  return cloudAPICall("adminRefreshAllCombinedPlaylistsV2");
}

async function refreshNewCombinedPlaylist(combo) {
  return cloudAPICall("refreshNewCombinedPlaylist", { combo });
}

async function backupCombinedPlaylists() {
  return cloudAPICall("backupCombinedPlaylists");
}

export const cloudService = {
  getAccessToken,
  getRefreshedAccessToken,
  getMe,
  getAllPlaylists,
  getPlaylist,
  getAllSongsFromPlaylist,
  deleteSongsFromPlaylist,
  unfollowPlaylist,
  createPlaylist,
  addSongsToPlaylist,
  adminRefreshAllCombinedPlaylists,
  refreshNewCombinedPlaylist,
  backupCombinedPlaylists,
};
