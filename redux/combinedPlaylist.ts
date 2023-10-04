import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { cloudService } from "../services/cloudService";
import app from "../lib/firebase";
import { getFirestore, collection, query, where, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

const db = getFirestore(app);

export interface CombinedPlaylistState {
  data: {
    id?: string;
    name?: string;
    uid?: string;
    playlists?: [{}];
  }[];
  isLoaded: boolean;
  hasErrors: boolean;
}

const initialState: CombinedPlaylistState = {
  data: [{}],
  isLoaded: false,
  hasErrors: false,
};

const combinedPlaylist = createSlice({
  name: "combinedPlaylist",
  initialState,
  reducers: {
    getData: (_) => {},

    getDataSuccess: (state, action: PayloadAction<any>) => {
      state.isLoaded = true;
      state.data = action.payload;
    },

    getDataFailure: (state, _) => {
      state.isLoaded = true;
      state.hasErrors = true;
    },
    createDataSuccess: (state, action: PayloadAction<any>) => {
      state.data.push(action.payload);
      state.isLoaded = true;
      state.hasErrors = false;
    },
    createDataFailure: (state) => {
      state.hasErrors = true;
    },
    removeData: (state, action: PayloadAction<any>) => {
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

export const fetchCombinedPlaylistsByUid = createAsyncThunk<any, { uid: string }>(
  "combinedPlaylist/fetchCombinedPlaylists",
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(getData());

    try {
      const data = await _fetchCombinedPlaylistsByUidFromDb(payload.uid);
      thunkAPI.dispatch(getDataSuccess(data));
      return data;
    } catch (error) {
      thunkAPI.dispatch(getDataFailure(null));
    }
  }
);

export const createCombinedPlaylist = createAsyncThunk<
  string | boolean,
  { id: string; url: string; uid: string; name: string; playlists: any[] }
>("combinedPlaylist/createCombinedPlaylist", async (payload, thunkAPI) => {
  try {
    await _createCombinedPlaylistInDb(
      payload.id,
      payload.url,
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
});

export const deleteCombinedPlaylist = createAsyncThunk<
  void,
  { id: string; access_token: string }
>("combinedPlaylist/deleteCombinedPlaylist", async (payload, thunkAPI) => {
  try {
    await cloudService.unfollowPlaylist(payload.id, payload.access_token);

    await _deleteCombinedPlaylistFromDb(payload.id);
    thunkAPI.dispatch(removeData(payload.id));
  } catch (error) {
    console.log(error.message);
  }
});

async function _fetchCombinedPlaylistsByUidFromDb(uid) {
  const q = query(collection(db, "combined_playlists"), where("uid", "==", uid));
  
  const querySnapshot = await getDocs(q);
  const data = [];
  querySnapshot.forEach((doc) => {  
    data.push(
      {
        id: doc.id,
        ...doc.data(),
        updatedAt: doc["updatedAt"]?.toDate().toISOString(),
      });
  });

  return data;
}

async function _createCombinedPlaylistInDb(id, url, uid, name, playlists) {
  const combinedPlaylistRef = collection(db, "combined_playlists");
  await setDoc(doc(combinedPlaylistRef, uid), {
    uid,
    url,
    name,
    playlists,
    updatedAt: serverTimestamp(),
  });
}

async function _deleteCombinedPlaylistFromDb(id) {
  const snapshot = await deleteDoc(doc(db, "combined_playlists", id));

  return snapshot;
}
