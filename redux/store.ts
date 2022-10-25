import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { createWrapper } from "next-redux-wrapper";
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
  return reducer(state, action);
};
const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    devTools: process.env.NODE_ENV === "development" ? true : false,
  });
const store = makeStore();

export const wrapper = createWrapper(makeStore);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
