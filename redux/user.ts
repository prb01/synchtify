import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import firebaseClient from "../lib/firebase";
import firebase from "firebase/app";
import { cloudService } from "../services/cloudService";

export interface UserState {
  data: {
    uid?: string;
    access_token?: string;
    refresh_token?: string;
    admin?: boolean;
    updatedAt?: string;
    createdAt?: string;
  };

  isLoaded: boolean;
  hasErrors: boolean;
  existsInDb: boolean;
  errorMsg: {};
}

const initialState: UserState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
  existsInDb: false,
  errorMsg: {},
};

const user = createSlice({
  name: "user",
  initialState,
  reducers: {
    getData: (state) => {},

    getDataSuccess: (state, action: PayloadAction<any>) => {
      state.isLoaded = true;
      state.data = action.payload;
    },

    getDataFailure: (state, action: PayloadAction<any>) => {
      state.isLoaded = true;
      state.hasErrors = true;
      state.errorMsg = action.payload;
    },
    createDataFailure: (state, action: PayloadAction<any>) => {
      state.hasErrors = true;
      state.errorMsg = action.payload;
    },
    appendData: (state) => {
      state.isLoaded = false;
      state.hasErrors = false;
      state.errorMsg = {};
    },
    appendDataSuccess: (state, action: PayloadAction<any>) => {
      state.isLoaded = true;
      state.existsInDb = true;
      state.data = { ...state.data, ...action.payload };
    },
    appendDataFailure: (state, action: PayloadAction<any>) => {
      state.isLoaded = true;
      state.hasErrors = true;
      state.errorMsg = action.payload;
    },
    logout: (state) => {},
  },
});

export const reducer = user.reducer;

export const {
  getData,
  getDataSuccess,
  getDataFailure,
  createDataFailure,
  appendData,
  appendDataSuccess,
  appendDataFailure,
  logout,
} = user.actions;

export const fetchUser = createAsyncThunk<void, { uid: string }>(
  "user/fetchUser",
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(appendData());

    try {
      const data = await _fetchUserFromDb(payload.uid);

      if (!data) {
        thunkAPI.dispatch(createUserData(payload));
      } else {
        thunkAPI.dispatch(
          appendDataSuccess({
            ...payload,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString(),
            updatedAt: data.updatedAt?.toDate().toISOString(),
          })
        );
      }
    } catch (error) {
      console.log(error);
      thunkAPI.dispatch(appendDataFailure(error.message));
    }
  }
);

export const createUserData = createAsyncThunk<void, { uid: string }>(
  "user/createUserData",
  async (payload, thunkAPI) => {
    try {
      await _createUserData(payload.uid);
      thunkAPI.dispatch(fetchUser(payload));
    } catch (error) {
      thunkAPI.dispatch(createDataFailure(error.message));
    }
  }
);

export const updateUserData = createAsyncThunk<
  void,
  { uid: string; access_token: string; refresh_token: string }
>("user/updateUserData", async (payload, thunkAPI) => {
  try {
    await _updateUserData(payload.uid, payload.access_token, payload.refresh_token);
    thunkAPI.dispatch(fetchUser(payload));
  } catch (error) {
    thunkAPI.dispatch(createDataFailure(error.message));
  }
});

export const addSpotifyAuth = createAsyncThunk<
  void,
  {
    uid: string;
    code: string | string[];
    state: string | string[];
    redirectURI: string;
  }
>("user/addSpotifyAuth", async (payload, thunkAPI) => {
  try {
    const data = await cloudService.getAccessToken(
      payload.code,
      payload.state,
      payload.redirectURI
    );

    thunkAPI.dispatch(
      updateUserData({
        uid: payload.uid,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })
    );
  } catch (error) {
    thunkAPI.dispatch(createDataFailure(error.message));
  }
});

export const updateSpotifyAuth = createAsyncThunk<
  void,
  { uid: string; refresh_token: string; redirectURI: string }
>("user/updateSpotifyAuth", async (payload, thunkAPI) => {
  try {
    const data = await cloudService.getRefreshedAccessToken(
      payload.refresh_token,
      payload.redirectURI
    );

    thunkAPI.dispatch(
      updateUserData({
        uid: payload.uid,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })
    );
  } catch (error) {
    thunkAPI.dispatch(createDataFailure(error.message));
  }
});

export async function _fetchUserFromDb(uid: string) {
  const snapshot = await firebaseClient
    .firestore()
    .collection("users")
    .where("uid", "==", uid)
    .get();

  const data = snapshot.docs[0] ? { ...snapshot.docs[0].data() } : null;

  return data;
}

async function _createUserData(uid: string) {
  const doc = await firebaseClient.firestore().collection("users").doc(uid).set({
    uid,
    access_token: null,
    refresh_token: null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  return doc;
}

async function _updateUserData(
  uid: string,
  access_token: string,
  refresh_token: string
) {
  const updateFields = refresh_token
    ? { access_token, refresh_token }
    : { access_token };
  const doc = await firebaseClient
    .firestore()
    .collection("users")
    .doc(uid)
    .update({
      ...updateFields,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

  return doc;
}
