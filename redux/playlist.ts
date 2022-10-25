import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { cloudService } from "../services/cloudService";

export interface PlaylistState {
  data: {
    images?: any;
    owner?: any;
    external_urls?: any;
    name?: string;
    id?: string;
    snapshot_id?: string;
  }[];
  isLoaded: boolean;
  hasErrors: boolean;
}

const initialState: PlaylistState = {
  data: [{}],
  isLoaded: false,
  hasErrors: false,
};

const playlist = createSlice({
  name: "playlist",
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
  },
});

export const reducer = playlist.reducer;

export const { getData, getDataSuccess, getDataFailure } = playlist.actions;

export const fetchSpotifyPlaylists = createAsyncThunk<
  void,
  { user: string; access_token: string }
>("playlist/fetchSpotifyPlaylists", async (payload, thunkAPI) => {
  try {
    thunkAPI.dispatch(getData());

    const playlists = await cloudService.getAllPlaylists(
      payload.user,
      payload.access_token
    );
    const sortedPlaylists = playlists.sort(
      (a, b) => a.name.toLowerCase() > b.name.toLowerCase()
    );

    thunkAPI.dispatch(getDataSuccess(sortedPlaylists));
  } catch (error) {
    thunkAPI.dispatch(getDataFailure(null));
  }
});
