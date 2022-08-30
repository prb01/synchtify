// https://dev.to/thatgalnatalie/how-to-get-started-with-redux-toolkit-41e
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { reducer as user } from "./user";
import { reducer as spotifyUser } from "./spotifyUser";
import { reducer as playlist } from "./playlist";
import { reducer as combinedPlaylist } from "./combinedPlaylist";

const reducer = combineReducers({
  user,
  spotifyUser,
  playlist,
  combinedPlaylist,
});

const rootReducer = (state, action) => {
  if (action.type === "user/logout") {
    state = undefined;
  }
  return reducer(state, action)
};

const store = configureStore({
  reducer: rootReducer,
  devTools: true,
});

export default store;
