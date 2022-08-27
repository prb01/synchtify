import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cloudService } from "services/cloudService";

const initialState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
};

const spotifyUser = createSlice({
  name: "spotifyUser",
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

export const reducer = spotifyUser.reducer;

export const {
  getData,
  getDataSuccess,
  getDataFailure,
} = spotifyUser.actions;

export const fetchSpotifyMe = createAsyncThunk(
  "spotifyUser/fetchSpotifyMe",
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(getData());
      const data = await cloudService.getMe(payload.access_token);
      thunkAPI.dispatch(getDataSuccess(data));

      return data.id;
    } catch (error) {
      thunkAPI.dispatch(getDataFailure());
    }
  }
);