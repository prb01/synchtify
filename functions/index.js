const axios = require("axios").default;
const functions = require("firebase-functions");
const {HttpsError, onCall, onRun} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
// admin.initializeApp();

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
initializeApp();
const db = getFirestore();

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
const spotifyState = process.env.REACT_APP_SPOTIFY_STATE;
const baseURI = "https://accounts.spotify.com";
const apiURI = "https://api.spotify.com/v1";
const redirectURI = `https://synchtify.prb01.com/dashboard`;

const SPOTIFY_PLAYLIST_LIMIT = 10000;

// Common error to check that user is logged in to run function
const checkUserLoggedIn = (context) => {
  if (!context.auth && context.resource.service !== "pubsub.googleapis.com") {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  } else return true;
};

const checkUserLoggedInV2 = (context) => {
  if (!context.auth && context.resource.service !== "pubsub.googleapis.com") {
    throw new HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  } else return true;
};

// Check user is accessing their own playlist
const checkUserIsSelf = (context, userId) => {
  if (!(context.auth.uid === userId)) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Data is not accessible for this user."
    );
  } else return true;
};

const checkUserIsSelfV2 = (context, userId) => {
  if (!(context.auth.uid === userId)) {
    throw new HttpsError(
      "failed-precondition",
      "Data is not accessible for this user."
    );
  } else return true;
};

// Check user is logged in and an admin to run
const checkUserIsAdmin = async (context) => {
  const user = await _fetchUserFromDb(context.auth.uid);

  if (!user.admin) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "This function is only available to admins."
    );
  } else return true;
};

const checkUserIsAdminV2 = async (context) => {
  const user = await _fetchUserFromDbV2(context.auth.uid);

  if (!user.admin) {
    throw new HttpsError(
      "failed-precondition",
      "This function is only available to admins."
    );
  } else return true;
};

// ----------------------------------------------------------------------
// START -- SPOTIFY API CALLS & HELPER FUNCTIONS --

// Helper call to handle errors
const spotifyAPICalls = async (context, opts) => {
  if (checkUserLoggedIn(context)) {
    try {
      const response = await axios({ ...opts, timeout: 10000 });
      return response.data;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a non 2.x.x status
        throw new functions.https.HttpsError("unknown", error.message);
      } else if (error.request) {
        // The request was made but no response was received
        throw new functions.https.HttpsError("unavailable", "No response received.");
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new functions.https.HttpsError(error.status, error.message);
      }
    }
  }

  return null;
};

const spotifyAPICallsV2 = async (request, opts) => {
  if (checkUserLoggedInV2(request)) {
    try {
      const response = await axios({ ...opts, timeout: 10000 });
      return response.data;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a non 2.x.x status
        throw new HttpsError("unknown", error.message);
      } else if (error.request) {
        // The request was made but no response was received
        throw new HttpsError("unavailable", "No response received.");
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new HttpsError(error.status, error.message);
      }
    }
  }

  return null;
};

// Get Spotify access token
const _getAccessToken = (data, context) => {
  const { code, state, redirectURI } = data;

  const formBody = new URLSearchParams();
  formBody.set("grant_type", "authorization_code");
  formBody.set("code", code);
  formBody.set("redirect_uri", redirectURI);

  const opts = {
    url: `${baseURI}/api/token`,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + new Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    data: formBody,
  };

  if (state !== spotifyState) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "States are not the same"
    );
  }

  return spotifyAPICalls(context, opts);
};

const _getAccessTokenV2 = (data, context) => {
  const { code, state, redirectURI } = data;

  const formBody = new URLSearchParams();
  formBody.set("grant_type", "authorization_code");
  formBody.set("code", code);
  formBody.set("redirect_uri", redirectURI);

  const opts = {
    url: `${baseURI}/api/token`,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + new Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    data: formBody,
  };

  if (state !== spotifyState) {
    throw new HttpsError(
      "invalid-argument",
      "States are not the same"
    );
  }

  return spotifyAPICallsV2(context, opts);
};

exports.getAccessToken = functions.https.onCall(async (data, context) => {
  return await _getAccessToken(data, context);
});

exports.getAccessTokenV2 = onCall(async (data, context) => {
  return await _getAccessTokenV2(data, context);
});

// Get refreshed access token
const _getRefreshedAccessToken = (data, context) => {
  const { refreshToken, redirectURI } = data;

  const formBody = new URLSearchParams();
  formBody.set("grant_type", "refresh_token");
  formBody.set("refresh_token", refreshToken);
  formBody.set("redirect_uri", redirectURI);

  const opts = {
    url: `${baseURI}/api/token`,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + new Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    data: formBody,
  };

  return spotifyAPICalls(context, opts);
};

const _getRefreshedAccessTokenV2 = (data, context) => {
  const { refreshToken, redirectURI } = data;

  const formBody = new URLSearchParams();
  formBody.set("grant_type", "refresh_token");
  formBody.set("refresh_token", refreshToken);
  formBody.set("redirect_uri", redirectURI);

  const opts = {
    url: `${baseURI}/api/token`,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + new Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    data: formBody,
  };

  return spotifyAPICallsV2(context, opts);
};

exports.getRefreshedAccessToken = functions.https.onCall(async (data, context) => {
  return await _getRefreshedAccessToken(data, context);
});

exports.getRefreshedAccessTokenV2 = onCall(async (data, context) => {
  return await _getRefreshedAccessTokenV2(data, context);
});

// Get Spotify Me
const _getMe = (data, context) => {
  const { access_token } = data;
  const opts = {
    url: `${apiURI}/me`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  return spotifyAPICalls(context, opts);
};

const _getMeV2 = (request) => {
  const { access_token } = request;
  const opts = {
    url: `${apiURI}/me`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  return spotifyAPICallsV2(request, opts);
};

exports.getMe = functions.https.onCall(async (data, context) => {
  return await _getMe(data, context);
});

exports.getMeV2 = onCall(async (request) => {
  return await _getMeV2(request);
});

// Get all playlists
const getPlaylists = (user, access_token, uri, context) => {
  const opts = {
    url: uri || `${apiURI}/users/${user}/playlists?offset=0&limit=50`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  return spotifyAPICalls(context, opts);
};

const getPlaylistsV2 = (user, access_token, uri, context) => {
  const opts = {
    url: uri || `${apiURI}/users/${user}/playlists?offset=0&limit=50`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  return spotifyAPICallsV2(context, opts);
};

const _getAllPlaylists = async (data, context) => {
  const { user, access_token } = data;
  const playlists = [];
  let response = { next: "first" };

  while (response.next) {
    response = await getPlaylists(
      user,
      access_token,
      response.next === "first" ? null : response.next,
      context
    );
    playlists.push(...response.items);
  }

  return playlists;
};

const _getAllPlaylistsV2 = async (data, context) => {
  const { user, access_token } = data;
  const playlists = [];
  let response = { next: "first" };

  while (response.next) {
    response = await getPlaylistsV2(
      user,
      access_token,
      response.next === "first" ? null : response.next,
      context
    );
    playlists.push(...response.items);
  }

  return playlists;
};

exports.getAllPlaylists = functions.https.onCall(async (data, context) => {
  return await _getAllPlaylists(data, context);
});

exports.getAllPlaylistsV2 = onCall(async (data, context) => {
  return await _getAllPlaylistsV2(data, context);
});

// Get one playlist
const _getPlaylist = (data, context) => {
  const { playlist_id, access_token } = data;
  const opts = {
    url: `${apiURI}/playlists/${playlist_id}`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  return spotifyAPICalls(context, opts);
};

const _getPlaylistV2 = (data, context) => {
  const { playlist_id, access_token } = data;
  const opts = {
    url: `${apiURI}/playlists/${playlist_id}`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  return spotifyAPICallsV2(context, opts);
};

exports.getPlaylist = functions.https.onCall(async (data, context) => {
  return await _getPlaylist(data, context);
});

exports.getPlaylistV2 = onCall(async (data, context) => {
  return await _getPlaylistV2(data, context);
});

// Get songs from playlist
const getSongsFromPlaylist = (playlist_id, access_token, uri, context) => {
  const opts = {
    url: uri || `${apiURI}/playlists/${playlist_id}/tracks?limit=50`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  return spotifyAPICalls(context, opts);
};

const getSongsFromPlaylistV2 = (playlist_id, access_token, uri, context) => {
  const opts = {
    url: uri || `${apiURI}/playlists/${playlist_id}/tracks?limit=50`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  return spotifyAPICallsV2(context, opts);
};

const _getAllSongsFromPlaylist = async (data, context) => {
  const { playlist_id, access_token } = data;
  const songs = [];
  let response = { next: "first" };

  while (response.next) {
    response = await getSongsFromPlaylist(
      playlist_id,
      access_token,
      response.next === "first" ? null : response.next,
      context
    );

    songs.push(...response.items);
  }

  return songs;
};

const _getAllSongsFromPlaylistV2 = async (data, context) => {
  const { playlist_id, access_token } = data;
  const songs = [];
  let response = { next: "first" };

  while (response.next) {
    response = await getSongsFromPlaylistV2(
      playlist_id,
      access_token,
      response.next === "first" ? null : response.next,
      context
    );

    songs.push(...response.items);
  }

  return songs;
};

exports.getAllSongsFromPlaylist = functions.https.onCall(async (data, context) => {
  return await _getAllSongsFromPlaylist(data, context);
});

exports.getAllSongsFromPlaylistV2 = onCall(async (data, context) => {
  return await _getAllSongsFromPlaylistV2(data, context);
});

// API call to delete songs from playlist
// Can only delete 100 at a time
// Tracks are in array json format: {"tracks": [{ "uri": "spotify:track:4iV5W9uYEdYUVa79Axb7Rh" },{ "uri": "spotify:track:1301WleyT98MSxVHPZCA6M" }] }
const _deleteSongsFromPlaylist = (data, context) => {
  const { playlist_id, access_token, tracks } = data;
  const opts = {
    url: `${apiURI}/playlists/${playlist_id}/tracks`,
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    data: JSON.stringify(tracks),
  };

  return spotifyAPICalls(context, opts);
};

const _deleteSongsFromPlaylistV2 = (data, context) => {
  const { playlist_id, access_token, tracks } = data;
  const opts = {
    url: `${apiURI}/playlists/${playlist_id}/tracks`,
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    data: JSON.stringify(tracks),
  };

  return spotifyAPICallsV2(context, opts);
};

exports.deleteSongsFromPlaylist = functions.https.onCall(async (data, context) => {
  return await _deleteSongsFromPlaylist(data, context);
});

exports.deleteSongsFromPlaylistV2 = onCall(async (data, context) => {
  return await _deleteSongsFromPlaylistV2(data, context);
});

// Delete (unfollow) a playlist
const _unfollowPlaylist = (data, context) => {
  const { playlist_id, access_token } = data;
  const opts = {
    url: `${apiURI}/playlists/${playlist_id}/followers`,
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  return spotifyAPICalls(context, opts);
};

const _unfollowPlaylistV2 = (data, context) => {
  const { playlist_id, access_token } = data;
  const opts = {
    url: `${apiURI}/playlists/${playlist_id}/followers`,
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  };

  return spotifyAPICallsV2(context, opts);
};

exports.unfollowPlaylist = functions.https.onCall(async (data, context) => {
  return await _unfollowPlaylist(data, context);
});

exports.unfollowPlaylistV2 = onCall(async (data, context) => {
  return await _unfollowPlaylistV2(data, context);
});

// API call to create a new playlist for a specific user id
const _createPlaylist = (data, context) => {
  const { user_id, access_token, name, description } = data;
  const payload = {
    name,
    description,
  };
  const opts = {
    url: `${apiURI}/users/${user_id}/playlists`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    data: JSON.stringify(payload),
  };

  return spotifyAPICalls(context, opts);
};

const _createPlaylistV2 = (data, context) => {
  const { user_id, access_token, name, description } = data;
  const payload = {
    name,
    description,
  };
  const opts = {
    url: `${apiURI}/users/${user_id}/playlists`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    data: JSON.stringify(payload),
  };

  return spotifyAPICallsV2(context, opts);
};

exports.createPlaylist = functions.https.onCall(async (data, context) => {
  return await _createPlaylist(data, context);
});

exports.createPlaylistV2 = onCall(async (data, context) => {
  return await _createPlaylistV2(data, context);
});

// API call to add tracks to a playlist
// Can only add 100 tracks at a time
// Tracks are an array of spotify track uris {"uris": ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M",
const _addSongsToPlaylist = (data, context) => {
  const { playlist_id, access_token, uris } = data;
  const payload = {
    uris,
  };
  const opts = {
    url: `${apiURI}/playlists/${playlist_id}/tracks`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    data: JSON.stringify(payload),
  };

  return spotifyAPICalls(context, opts);
};

const _addSongsToPlaylistV2 = (data, context) => {
  const { playlist_id, access_token, uris } = data;
  const payload = {
    uris,
  };
  const opts = {
    url: `${apiURI}/playlists/${playlist_id}/tracks`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    data: JSON.stringify(payload),
  };

  return spotifyAPICallsV2(context, opts);
};

exports.addSongsToPlaylist = functions.https.onCall(async (data, context) => {
  return await _addSongsToPlaylist(data, context);
});

exports.addSongsToPlaylistV2 = onCall(async (data, context) => {
  return await _addSongsToPlaylistV2(data, context);
});

//END   -- SPOTIFY API CALLS & HELPER FUNCTIONS --
//----------------------------------------------------------------------

//------------------------------------------------
//START -- UTILS --
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const retry = (maxRetries, fn, sleepTime = 1000, name = "") => {
  return fn().catch(async (error) => {
    if (maxRetries <= 0) {
      console.log(error.message);
      throw new functions.https.HttpsError("unknown", error.message);
    }

    console.error("**ERROR**", error.message, JSON.stringify(error));
    console.log(`*******waiting ${sleepTime / 1000}s before retrying*******`);
    if (name !== "") console.log(`TRIES LEFT: ${maxRetries} for ${name}`);

    await sleep(sleepTime);

    return retry(maxRetries - 1, fn, sleepTime * 2);
  });
};

const retryV2 = (maxRetries, fn, sleepTime = 1000, name = "") => {
  return fn().catch(async (error) => {
    if (maxRetries <= 0) {
      console.log(error.message);
      throw new HttpsError("unknown", error.message);
    }

    console.error("**ERROR**", error.message, JSON.stringify(error));
    console.log(`*******waiting ${sleepTime / 1000}s before retrying*******`);
    if (name !== "") console.log(`TRIES LEFT: ${maxRetries} for ${name}`);

    await sleep(sleepTime);

    return retry(maxRetries - 1, fn, sleepTime * 2);
  });
};

const _fetchAllCombinedPlaylistsFromDb = async (
  collection = "combined_playlists"
) => {
  const snapshot = await admin.firestore().collection(collection).get();
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return data;
};

const _fetchAllCombinedPlaylistsFromDbV2 = async (
  collection = "combined_playlists"
) => {
  const snapshot = await db.collection(collection).get();
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return data;
};

const _fetchUserFromDb = async (uid) => {
  const snapshot = await admin
    .firestore()
    .collection("users")
    .where("uid", "==", uid)
    .get();
  const data = snapshot.docs[0] ? { ...snapshot.docs[0].data() } : null;
  return data;
};

const _fetchUserFromDbV2 = async (uid) => {
  const snapshot = await db
    .collection("users")
    .where("uid", "==", uid)
    .get();
  const data = snapshot.docs[0] ? { ...snapshot.docs[0].data() } : null;
  console.log("_fetchUserFromDbV2", data);
  return data;
};

const _updatePlaylistsInDb = async (id, playlists) => {
  const doc = await admin
    .firestore()
    .collection("combined_playlists")
    .doc(id)
    .update({ updatedAt: admin.firestore.FieldValue.serverTimestamp(), playlists });

  return doc;
};

const _updatePlaylistsInDbV2 = async (id, playlists) => {
  const doc = await admin
    .firestore()
    .collection("combined_playlists")
    .doc(id)
    .update({ updatedAt: FieldValue.serverTimestamp(), playlists });

  return doc;
};

const _createCombinedPlaylistInDb = async (collection, url, id, uid, name, playlists) => {
  try {
    await admin.firestore().collection(collection).doc(id).set({
      uid,
      url,
      name,
      playlists,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.log(error);
  }
};

const _createCombinedPlaylistInDbV2 = async (collection, url, id, uid, name, playlists) => {
  try {
    await db.collection(collection).doc(id).set({
      uid,
      url,
      name,
      playlists,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.log(error);
  }
};

const _RefreshCombinedPlaylist = async (context, combo, firstRun = null) => {
  // number of times to retry API call if it fails
  const retries = 5;

  // pull user info
  let user = await _fetchUserFromDb(combo.uid);
  const uid = user.uid;

  // Check if user has a refresh token, otherwise skip
  if(!user.refresh_token) return null;

  console.log(`SYNCHING ${combo.name} for ${uid}`);

  // refresh token
  console.log(`START REFRESHING ACCESS TOKEN for ${uid}`);
  user = await retry(retries, () =>
    _getRefreshedAccessToken(
      {
        refreshToken: user.refresh_token,
        redirectURI: redirectURI,
      },
      context
    )
  );
  console.log(`END REFRESHING ACCESS TOKEN (${uid})`);

  // check playlist still exists, else next
  console.log(`START CHECKING PLAYLIST EXISTS (${uid}, ${combo.id})`);
  const playlist = await retry(retries, () =>
    _getPlaylist(
      {
        playlist_id: combo.id,
        access_token: user.access_token,
      },
      context
    )
  );
  console.log(`END CHECKING PLAYLIST EXISTS (${uid}, ${combo.id}, ${!!playlist})`);

  if (!playlist) return;

  // check if underlying playlists have changed since last refresh
  console.log(`START CHECK PLAYLIST CHANGES (${uid}, ${combo.id})`);
  let refresh = false;
  const newPlaylists = [];

  if (!firstRun) {
    for (const playlist of combo.playlists) {
      const spotifyPlaylist = await retry(retries, () =>
        _getPlaylist(
          {
            playlist_id: playlist.id,
            access_token: user.access_token,
          },
          context
        )
      );

      console.log({
        spotSnap: spotifyPlaylist.snapshot_id,
        dbSnap: playlist.snapshotId,
        same: spotifyPlaylist.snapshot_id === playlist.snapshotId,
      });

      if (spotifyPlaylist.snapshot_id !== playlist.snapshotId) {
        refresh = true;
      }

      newPlaylists.push({
        id: spotifyPlaylist.id,
        name: spotifyPlaylist.name,
        snapshotId: spotifyPlaylist.snapshot_id,
      });
    }

    if (!refresh) return;
  }

  console.log(`END CHECK PLAYLIST CHANGES (${uid}, ${combo.id}, ${refresh})`);

  // get all songs in combined playlist
  console.log(`START FETCH ALL SONGS FROM COMBO (${uid}, ${combo.id})`);
  const tracks = await retry(retries, () =>
    _getAllSongsFromPlaylist(
      {
        playlist_id: combo.id,
        access_token: user.access_token,
      },
      context
    )
  );
  const tracksURI = tracks.map((track) => {
    if(!track.track) console.log(JSON.stringify(track));

    return {
      uri: track.track?.uri || null,  
    }
  });
  const tracksURIFiltered = tracksURI.filter((track) => !!track.uri);
  console.log(`END FETCH ALL SONGS FROM COMBO (${uid}, ${combo.id})`);

  // remove all songs in combined playlist
  console.log(
    `START REMOVING ${tracksURIFiltered.length} tracks in ${combo.name} (${uid}, ${combo.id})`
  );
  while (tracksURIFiltered.length > 0) {
    const deleteResponse = await retry(retries, () =>
      _deleteSongsFromPlaylist(
        {
          playlist_id: combo.id,
          access_token: user.access_token,
          tracks: {
            tracks: tracksURIFiltered.slice(0, 100),
          },
        },
        context
      )
    );

    // only remove tracks if delete was successful
    tracksURIFiltered.splice(0, 100);
  }
  console.log(`END REMOVING tracks in ${combo.name} (${uid}, ${combo.id})`);

  // loop through playlists
  console.log(
    `START FETCH SONGS PLAYLISTS (${uid}, ${combo.id}, ${combo.playlists.length})`
  );
  const tracksToAdd = [];
  for (const playlist of combo.playlists) {
    // get all songs from playlist, add to array
    console.log(`GETTING TRACKS FOR PLAYLIST ${playlist.name} (${playlist.id})`);;
    const tracks = await retry(retries, () =>
      _getAllSongsFromPlaylist(
        {
          playlist_id: playlist.id,
          access_token: user.access_token,
        },
        context
      )
    );

    console.log('PULLED TRACKS');
    const tracksNotLocal = tracks
      .filter((track) => {
        if (!(!!track && !!track.track && !track.track.is_local)) {
          console.log(`Track: ${JSON.stringify(track)}`);
        }
        return !!track && !!track.track && !track.track.is_local;
      })
      .map((track) => track.track.uri);
    tracksToAdd.push(...tracksNotLocal);

    console.log(`BUFFERING ${tracksNotLocal.length} from ${playlist.name}`);
  }
  console.log(
    `END FETCH SONGS PLAYLISTS (${uid}, ${combo.id}, ${combo.playlists.length})`
  );

  // Check if tracks to add is above 10k, if so, exit early
  if (tracksToAdd.length > SPOTIFY_PLAYLIST_LIMIT) {
    console.log(
      `Cannot create ${combo.name} as it has too many songs. (${tracksToAdd.length}; limit ${SPOTIFY_PLAYLIST_LIMIT})`
    );
    return;
  }

  // remove duplicates?

  // add all songs to combined playlist
  console.log(
    `START ADDING ${tracksToAdd.length} tracks to ${combo.name} (${uid}, ${combo.id})`
  );
  while (tracksToAdd.length > 0) {
    const addResponse = await retry(retries, () =>
      _addSongsToPlaylist(
        {
          playlist_id: combo.id,
          access_token: user.access_token,
          uris: tracksToAdd.slice(0, 100),
        },
        context
      )
    );

    // only remove from tracksToAdd if add was successful
    tracksToAdd.splice(0, 100);
  }

  // update playlists in DB with new snapshot id
  if (refresh) await _updatePlaylistsInDb(combo.id, newPlaylists);

  console.log(`END ADDING tracks to ${combo.name} (${uid}, ${combo.id})`);
  console.log(`DONE combining for ${combo.name}`);
  console.log(`**********************************************************`);

  return null;
};

const _RefreshCombinedPlaylistV2 = async (context, combo, firstRun = null) => {
  // number of times to retry API call if it fails
  const retries = 5;

  // pull user info
  let user = await _fetchUserFromDbV2(combo.uid);
  const uid = user.uid;

  // Check if user has a refresh token, otherwise skip
  if(!user.refresh_token) return null;

  console.log(`SYNCHING ${combo.name} for ${uid}`);

  // refresh token
  console.log(`START REFRESHING ACCESS TOKEN for ${uid}`);
  user = await retryV2(retries, () =>
    _getRefreshedAccessTokenV2(
      {
        refreshToken: user.refresh_token,
        redirectURI: redirectURI,
      },
      context
    )
  );
  console.log(`END REFRESHING ACCESS TOKEN (${uid})`);

  // check playlist still exists, else next
  console.log(`START CHECKING PLAYLIST EXISTS (${uid}, ${combo.id})`);
  const playlist = await retry(retries, () =>
    _getPlaylistV2(
      {
        playlist_id: combo.id,
        access_token: user.access_token,
      },
      context
    )
  );
  console.log(`END CHECKING PLAYLIST EXISTS (${uid}, ${combo.id}, ${!!playlist})`);

  if (!playlist) return;

  // check if underlying playlists have changed since last refresh
  console.log(`START CHECK PLAYLIST CHANGES (${uid}, ${combo.id})`);
  let refresh = false;
  const newPlaylists = [];

  if (!firstRun) {
    for (const playlist of combo.playlists) {
      const spotifyPlaylist = await retry(retries, () =>
        _getPlaylistV2(
          {
            playlist_id: playlist.id,
            access_token: user.access_token,
          },
          context
        )
      );

      console.log({
        spotSnap: spotifyPlaylist.snapshot_id,
        dbSnap: playlist.snapshotId,
        same: spotifyPlaylist.snapshot_id === playlist.snapshotId,
      });

      if (spotifyPlaylist.snapshot_id !== playlist.snapshotId) {
        refresh = true;
      }

      newPlaylists.push({
        id: spotifyPlaylist.id,
        name: spotifyPlaylist.name,
        snapshotId: spotifyPlaylist.snapshot_id,
      });
    }

    if (!refresh) return;
  }

  console.log(`END CHECK PLAYLIST CHANGES (${uid}, ${combo.id}, ${refresh})`);

  // get all songs in combined playlist
  console.log(`START FETCH ALL SONGS FROM COMBO (${uid}, ${combo.id})`);
  const tracks = await retryV2(retries, () =>
    _getAllSongsFromPlaylistV2(
      {
        playlist_id: combo.id,
        access_token: user.access_token,
      },
      context
    )
  );
  const tracksURI = tracks.map((track) => {
    if(!track.track) console.log(JSON.stringify(track));

    return {
      uri: track.track?.uri || null,  
    }
  });
  const tracksURIFiltered = tracksURI.filter((track) => !!track.uri);
  console.log(`END FETCH ALL SONGS FROM COMBO (${uid}, ${combo.id})`);

  // remove all songs in combined playlist
  console.log(
    `START REMOVING ${tracksURIFiltered.length} tracks in ${combo.name} (${uid}, ${combo.id})`
  );
  while (tracksURIFiltered.length > 0) {
    const deleteResponse = await retry(retries, () =>
      _deleteSongsFromPlaylistV2(
        {
          playlist_id: combo.id,
          access_token: user.access_token,
          tracks: {
            tracks: tracksURIFiltered.slice(0, 100),
          },
        },
        context
      )
    );

    // only remove tracks if delete was successful
    tracksURIFiltered.splice(0, 100);
  }
  console.log(`END REMOVING tracks in ${combo.name} (${uid}, ${combo.id})`);

  // loop through playlists
  console.log(
    `START FETCH SONGS PLAYLISTS (${uid}, ${combo.id}, ${combo.playlists.length})`
  );
  const tracksToAdd = [];
  for (const playlist of combo.playlists) {
    // get all songs from playlist, add to array
    console.log(`GETTING TRACKS FOR PLAYLIST ${playlist.name} (${playlist.id})`);;
    const tracks = await retryV2(retries, () =>
      _getAllSongsFromPlaylistV2(
        {
          playlist_id: playlist.id,
          access_token: user.access_token,
        },
        context
      )
    );

    console.log('PULLED TRACKS');
    const tracksNotLocal = tracks
      .filter((track) => {
        if (!(!!track && !!track.track && !track.track.is_local)) {
          console.log(`Track: ${JSON.stringify(track)}`);
        }
        return !!track && !!track.track && !track.track.is_local;
      })
      .map((track) => track.track.uri);
    tracksToAdd.push(...tracksNotLocal);

    console.log(`BUFFERING ${tracksNotLocal.length} from ${playlist.name}`);
  }
  console.log(
    `END FETCH SONGS PLAYLISTS (${uid}, ${combo.id}, ${combo.playlists.length})`
  );

  // Check if tracks to add is above 10k, if so, exit early
  if (tracksToAdd.length > SPOTIFY_PLAYLIST_LIMIT) {
    console.log(
      `Cannot create ${combo.name} as it has too many songs. (${tracksToAdd.length}; limit ${SPOTIFY_PLAYLIST_LIMIT})`
    );
    return;
  }

  // remove duplicates?

  // add all songs to combined playlist
  console.log(
    `START ADDING ${tracksToAdd.length} tracks to ${combo.name} (${uid}, ${combo.id})`
  );
  while (tracksToAdd.length > 0) {
    const addResponse = await retryV2(retries, () =>
      _addSongsToPlaylistV2(
        {
          playlist_id: combo.id,
          access_token: user.access_token,
          uris: tracksToAdd.slice(0, 100),
        },
        context
      )
    );

    // only remove from tracksToAdd if add was successful
    tracksToAdd.splice(0, 100);
  }

  // update playlists in DB with new snapshot id
  if (refresh) await _updatePlaylistsInDbV2(combo.id, newPlaylists);

  console.log(`END ADDING tracks to ${combo.name} (${uid}, ${combo.id})`);
  console.log(`DONE combining for ${combo.name}`);
  console.log(`**********************************************************`);

  return null;
};

exports.adminRefreshAllCombinedPlaylists = functions
  .runWith({ timeoutSeconds: 540, memory: "2GB" })
  .https.onCall(async (data, context) => {
    if (await checkUserIsAdmin(context)) {
      // fetch all combined playlists
      const combinedPlaylists = await _fetchAllCombinedPlaylistsFromDb();
      console.log(`BEGIN REFRESH FOR ${combinedPlaylists.length} combos`);
      return new Promise(async (resolve, reject) => {
        try {
          for (const combo of combinedPlaylists) {
            await retry(
              3,
              () => _RefreshCombinedPlaylist(context, combo),
              3000,
              combo.name
            );
          }

          return resolve("Synch Finished");
        } catch (error) {
          return reject(error.message);
        }
      });
    }

    return null;
  });

exports.adminRefreshAllCombinedPlaylistsV2 = onCall({ cors: true, timeoutSeconds: 1200, memory: "256MB" }, async (request) => {
    if (await checkUserIsAdminV2(request)) {
      // fetch all combined playlists
      const combinedPlaylists = await _fetchAllCombinedPlaylistsFromDbV2();
      console.log(`BEGIN REFRESH FOR ${combinedPlaylists.length} combos`);
      return new Promise(async (resolve, reject) => {
        try {
          for (const combo of combinedPlaylists) {
            await retryV2(
              3,
              () => _RefreshCombinedPlaylistV2(request, combo),
              3000,
              combo.name
            );
          }

          return resolve("Synch Finished");
        } catch (error) {
          return reject(error.message);
        }
      });
    }

    return null;
  });

// exports.scheduledAdminRefreshAllCombinedPlaylists = functions
//   .runWith({ timeoutSeconds: 540, memory: "2GB" })
//   .pubsub.schedule("every 12 hours")
//   .onRun(async (context) => {
//     console.log("*** Scheduled run of Admin Refresh all ***");

//     // fetch all combined playlists
//     const combinedPlaylists = await _fetchAllCombinedPlaylistsFromDb();

//     console.log(`BEGIN REFRESH FOR ${combinedPlaylists.length} combos`);
//     return new Promise(async (resolve, reject) => {
//       try {
//         for (const combo of combinedPlaylists) {
//           await retry(
//             3,
//             () => _RefreshCombinedPlaylist(context, combo),
//             3000,
//             combo.name
//           );
//         }

//         return resolve("Synch Finished");
//       } catch (error) {
//         return reject(error.message);
//       }
//     });
//   });

exports.scheduledAdminRefreshAllCombinedPlaylistsV2 = onSchedule({ schedule: "every 12 hours", timeoutSeconds: 1200, memory: "256MB" }, async (context) => {
    console.log("*** Scheduled run of Admin Refresh all ***");

    // fetch all combined playlists
    const combinedPlaylists = await _fetchAllCombinedPlaylistsFromDbV2();

    console.log(`BEGIN REFRESH FOR ${combinedPlaylists.length} combos`);
    return new Promise(async (resolve, reject) => {
      try {
        for (const combo of combinedPlaylists) {
          await retryV2(
            3,
            () => _RefreshCombinedPlaylistV2(context, combo),
            3000,
            combo.name
          );
        }

        return resolve("Synch Finished");
      } catch (error) {
        return reject(error.message);
      }
    });
  });

exports.refreshNewCombinedPlaylist = functions
  .runWith({ timeoutSeconds: 90 })
  .https.onCall(async (data, context) => {
    const { combo } = data;

    if (checkUserLoggedIn(context) && checkUserIsSelf(context, combo.uid)) {
      return new Promise(async (resolve, reject) => {
        try {
          await retry(
            3,
            () => _RefreshCombinedPlaylist(context, combo, true),
            3000,
            combo.name
          );

          return resolve("Synch Finished");
        } catch (error) {
          return reject(error.message);
        }
      });
    }
  });

exports.refreshNewCombinedPlaylistV2 = onCall({ timeoutSeconds: 90 }, async (data, context) => {
    const { combo } = data;

    if (checkUserLoggedInV2(context) && checkUserIsSelfV2(context, combo.uid)) {
      return new Promise(async (resolve, reject) => {
        try {
          await retryV2(
            3,
            () => _RefreshCombinedPlaylistV2(context, combo, true),
            3000,
            combo.name
          );

          return resolve("Synch Finished");
        } catch (error) {
          return reject(error.message);
        }
      });
    }
  });

exports.backupCombinedPlaylists = functions.https.onCall(async (data, context) => {
  if (await checkUserIsAdmin(context)) {
    const fetchCollection = "combined_playlists";
    const backupCollection = "combined_playlists_backup";
    return new Promise(async (resolve, reject) => {
      try {
        const combinedPlaylists = await _fetchAllCombinedPlaylistsFromDb(
          fetchCollection
        );

        for (const combo of combinedPlaylists) {
          console.log(`BACKING UP ${combo.name} (${combo.id}) for ${combo.uid} [${backupCollection} ${combo.id}]`);
          await _createCombinedPlaylistInDb(
            backupCollection,
            combo.url ?? "",
            combo.id,
            combo.uid,
            combo.name,
            combo.playlists
          );
        }

        return resolve("Combined playlists backed up");
      } catch (error) {
        return reject(error.message);
      }
    });
  }
  return null;
});

exports.backupCombinedPlaylistsV2 = onCall(async (data, context) => {
  if (await checkUserIsAdminV2(context)) {
    const fetchCollection = "combined_playlists";
    const backupCollection = "combined_playlists_backup";
    return new Promise(async (resolve, reject) => {
      try {
        const combinedPlaylists = await _fetchAllCombinedPlaylistsFromDbV2(
          fetchCollection
        );

        for (const combo of combinedPlaylists) {
          console.log(`BACKING UP ${combo.name} (${combo.id}) for ${combo.uid} [${backupCollection} ${combo.id}]`);
          await _createCombinedPlaylistInDbV2(
            backupCollection,
            combo.url ?? "",
            combo.id,
            combo.uid,
            combo.name,
            combo.playlists
          );
        }

        return resolve("Combined playlists backed up");
      } catch (error) {
        return reject(error.message);
      }
    });
  }
  return null;
});

//END   -- UTILS --
//----------------------------------------------------------------------
