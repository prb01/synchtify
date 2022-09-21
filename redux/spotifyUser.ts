import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { cloudService } from "../services/cloudService";

export interface SpotifyUserState {
  data: {
    display_name?: string;
    href?: string;
    id?: string;
  };
  isLoaded: boolean;
  hasErrors: boolean;
}

const initialState: SpotifyUserState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
};

const spotifyUser = createSlice({
  name: "spotifyUser",
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

export const reducer = spotifyUser.reducer;

export const { getData, getDataSuccess, getDataFailure } = spotifyUser.actions;

export const fetchSpotifyMe = createAsyncThunk<string, { access_token: string }>(
  "spotifyUser/fetchSpotifyMe",
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(getData());
      const data = await cloudService.getMe(payload.access_token);
      thunkAPI.dispatch(getDataSuccess(data));

      return data.id as string;
    } catch (error) {
      thunkAPI.dispatch(getDataFailure(null));
    }
  }
);
