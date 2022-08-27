import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cloudService } from "services/cloudService";

const initialState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
};

const playlist = createSlice({
  name: "playlist",
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
  },
});

export const reducer = playlist.reducer;

export const { getData, getDataSuccess, getDataFailure } = playlist.actions;

export const fetchSpotifyPlaylists = createAsyncThunk(
  "playlist/fetchSpotifyPlaylists",
  async (payload, thunkAPI) => {
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
      thunkAPI.dispatch(getDataFailure());
    }
  }
);