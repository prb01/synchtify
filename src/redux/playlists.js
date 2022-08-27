import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cloudService } from "services/cloudService";

const initialState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
};

const playlists = createSlice({
  name: "playlists",
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

export const reducer = playlists.reducer;

export const { getData, getDataSuccess, getDataFailure } = playlists.actions;

export const fetchSpotifyPlaylists = createAsyncThunk(
  "playlists/fetchSpotifyPlaylists",
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