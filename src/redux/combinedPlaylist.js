import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cloudService } from "services/cloudService";
import firebaseClient from "firebase/client";
import firebase from "firebase/app";

const initialState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
};

const combinedPlaylist = createSlice({
  name: "combinedPlaylist",
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
    },
    createDataSuccess: (state, action) => {
      state.data.push(action.payload);
      state.isLoaded = true;
      state.hasErrors = false;
    },
    createDataFailure: (state) => {
      state.hasErrors = true;
    },
    removeData: (state, action) => {
      state.data = state.data.filter((playlist) => playlist.id !== action.payload);
    },
  },
});

export const reducer = combinedPlaylist.reducer;

export const {
  getData,
  getDataSuccess,
  getDataFailure,
  createDataSuccess,
  createDataFailure,
  removeData,
} = combinedPlaylist.actions;

export const fetchCombinedPlaylistsByUid = createAsyncThunk(
  "combinedPlaylist/fetchCombinedPlaylists",
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(getData());

    try {
      const data = await _fetchCombinedPlaylistsByUidFromDb(payload.uid);
      thunkAPI.dispatch(getDataSuccess(data));
      return data;
    } catch (error) {
      thunkAPI.dispatch(getDataFailure());
    }
  }
);

export const createCombinedPlaylist = createAsyncThunk(
  "combinedPlaylist/createCombinedPlaylist",
  async (payload, thunkAPI) => {
    try {
      await _createCombinedPlaylistInDb(
        payload.id,
        payload.uid,
        payload.name,
        payload.playlists
      );

      thunkAPI.dispatch(createDataSuccess(payload));

      return payload.id;
    } catch (error) {
      thunkAPI.dispatch(createDataFailure());
      return false;
    }
  }
);

export const deleteCombinedPlaylist = createAsyncThunk(
  "combinedPlaylist/deleteCombinedPlaylist",
  async (payload, thunkAPI) => {
    try {
      await cloudService.unfollowPlaylist(payload.id, payload.access_token);

      await _deleteCombinedPlaylistFromDb(payload.id);
      thunkAPI.dispatch(removeData(payload.id));
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

async function _createCombinedPlaylistInDb(id, uid, name, playlists) {
  await firebaseClient.firestore().collection("combined_playlists").doc(id).set({
    uid,
    name,
    playlists,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

async function _deleteCombinedPlaylistFromDb(id) {
  const snapshot = await firebaseClient
    .firestore()
    .collection("combined_playlists")
    .doc(id)
    .delete();

  return snapshot;
}
