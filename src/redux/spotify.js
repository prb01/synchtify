import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cloudService } from "services/cloudService";
import firebaseClient from "firebase/client";
import firebase from "firebase/app";

const initialState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
  errorMsg: {},
};

const spotify = createSlice({
  name: "spotify",
  initialState,
  reducers: {
    getData: (state) => {},

    getDataSuccess: (state, action) => {
      state.isLoaded = true;
      state.data = action.payload;
    },

    getDataFailure: (state, action) => {
      state.isLoaded = true;
      state.hasErrors = true;
      state.errorMsg = action.payload;
    },
    createDataFailure: (state, action) => {
      state.hasErrors = true;
      state.errorMsg = action.payload;
    },
    appendData: (state) => {
      state.isLoaded = false;
      state.hasErrors = false;
      state.errorMsg = {};
    },
    appendDataSuccess: (state, action) => {
      state.isLoaded = true;
      state.data = { ...state.data, ...action.payload };
    },
    appendDataFailure: (state, action) => {
      state.isLoaded = true;
      state.hasErrors = true;
      state.errorMsg = action.payload;
    },
    removeCombinedPlaylist: (state, action) => {
      state.data.combinedPlaylists = state.data.combinedPlaylists.filter(
        (playlist) => playlist.id !== action.payload.id
      );
    },
  },
});

export const reducer = spotify.reducer;

export const {
  getData,
  getDataSuccess,
  getDataFailure,
  createDataFailure,
  appendData,
  appendDataSuccess,
  appendDataFailure,
  removeCombinedPlaylist,
} = spotify.actions;

export const fetchSpotifyPlaylists = createAsyncThunk(
  "spotify/fetchSpotifyPlaylists",
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(appendData());

      const playlists = await cloudService.getAllPlaylists(
        payload.user,
        payload.access_token
      );

      const sortedPlaylists = playlists.sort(
        (a, b) => a.name.toLowerCase() > b.name.toLowerCase()
      );

      thunkAPI.dispatch(appendDataSuccess({ playlists: sortedPlaylists }));
    } catch (error) {
      thunkAPI.dispatch(appendDataFailure(error.message));
    }
  }
);

export const fetchCombinedPlaylistsByUid = createAsyncThunk(
  "spotify/fetchCombinedPlaylists",
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(appendData());

    try {
      const data = await _fetchCombinedPlaylistsByUidFromDb(payload.uid);

      thunkAPI.dispatch(appendDataSuccess({ combinedPlaylists: data }));

      return data;
    } catch (error) {
      thunkAPI.dispatch(appendDataFailure(error.message));
    }
  }
);

export const createCombinedPlaylist = createAsyncThunk(
  "spotify/createCombinedPlaylist",
  async (payload, thunkAPI) => {
    try {
      await _createCombinedPlaylistInDb(
        payload.id,
        payload.uid,
        payload.name,
        payload.playlists
      );

      return payload.id;
    } catch (error) {
      thunkAPI.dispatch(createDataFailure(error.message));
      return false;
    }
  }
);

export const deleteCombinedPlaylist = createAsyncThunk(
  "spotify/deleteCombinedPlaylist",
  async (payload, thunkAPI) => {
    try {
      await cloudService.unfollowPlaylist(payload.id, payload.access_token);

      await _deleteCombinedPlaylistFromDb(payload.id);
      thunkAPI.dispatch(removeCombinedPlaylist(payload));
    } catch (error) {
      console.log(error.message);
    }
  }
);

async function _fetchCombinedPlaylistsByUidFromDb(uid) {
  const snapshot = await firebaseClient
    .firestore()
    .collection("combined_playlists")
    .where("uid", "==", uid)
    .get();

  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    updatedAt: doc.updatedAt?.toDate().toISOString(),
  }));

  return data;
}

export async function _fetchAllCombinedPlaylistsFromDb() {
  const snapshot = await firebaseClient.firestore().collection("combined_playlists").get();

  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return data;
}

async function _createCombinedPlaylistInDb(id, uid, name, playlists) {
  const doc = await firebaseClient
    .firestore()
    .collection("combined_playlists")
    .doc(id)
    .set({
      uid,
      name,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      playlists
    });

  return doc;
}

async function _deleteCombinedPlaylistFromDb(id) {
  const snapshot = await firebaseClient
    .firestore()
    .collection("combined_playlists")
    .doc(id)
    .delete();

  return snapshot;
}
