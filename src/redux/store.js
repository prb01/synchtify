// https://dev.to/thatgalnatalie/how-to-get-started-with-redux-toolkit-41e
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { reducer as user } from "./user";
import { reducer as spotify } from "./spotify";
import { reducer as spotifyUser } from "./spotifyUser";
import { reducer as playlist } from "./playlist";
import { reducer as combinedPlaylist } from "./combinedPlaylist";

const reducer = combineReducers({
  user,
  spotify,
  spotifyUser,
  playlist,
  combinedPlaylist,
});

const store = configureStore({
  reducer,
  devTools: true,
});

export default store;
