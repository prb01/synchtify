// import firebase from "firebase/app";
import app from "../lib/firebase";
// require("firebase/functions");
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
const functions = getFunctions(app);
connectFunctionsEmulator(functions, "127.0.0.1", 5001);

async function cloudAPICall(cloudFunction, payload = {}) : Promise<any> {
  try {
    const _functionCall = httpsCallable(functions, cloudFunction);
    const { data } = await _functionCall(payload);
    return data;
  } catch (error) {
    console.log(JSON.stringify(error));
  }
}

async function getAccessToken(code, state, redirectURI) : Promise<any> {
  return cloudAPICall("getAccessToken", { code, state, redirectURI });
}

async function getRefreshedAccessToken(refreshToken, redirectURI) : Promise<any> {
  return cloudAPICall("getRefreshedAccessToken", { refreshToken, redirectURI });
}

async function getMe(access_token) : Promise<any> {
  return cloudAPICall("getMeV2", { access_token });
}

async function getAllPlaylists(user, access_token) : Promise<any> {
  return cloudAPICall("getAllPlaylists", { user, access_token });
}

async function getPlaylist(playlist_id, access_token) : Promise<any> {
  return cloudAPICall("getPlaylist", { playlist_id, access_token });
}

async function getAllSongsFromPlaylist(playlist_id, access_token) : Promise<any> {
  return cloudAPICall("getAllSongsFromPlaylist", { playlist_id, access_token });
}

async function deleteSongsFromPlaylist(playlist_id, access_token, tracks) : Promise<any> {
  return cloudAPICall("deleteSongsFromPlaylist", {
    playlist_id,
    access_token,
    tracks,
  });
}

async function unfollowPlaylist(playlist_id, access_token) : Promise<any> {
  return cloudAPICall("unfollowPlaylist", { playlist_id, access_token });
}

async function createPlaylist(
  user_id,
  access_token,
  name,
  description = "Combined playlist made with Synchtify (synchtify.prb01.com)"
) : Promise<any> {
  return cloudAPICall("createPlaylist", {
    user_id,
    access_token,
    name,
    description,
  });
}

async function addSongsToPlaylist(playlist_id, access_token, uris) : Promise<any> {
  return cloudAPICall("addSongsToPlaylist", { playlist_id, access_token, uris });
}

async function adminRefreshAllCombinedPlaylists() : Promise<any> {
  return cloudAPICall("adminRefreshAllCombinedPlaylistsV2");
}

async function refreshNewCombinedPlaylist(combo) : Promise<any> {
  return cloudAPICall("refreshNewCombinedPlaylist", { combo });
}

async function backupCombinedPlaylists() : Promise<any> {
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
