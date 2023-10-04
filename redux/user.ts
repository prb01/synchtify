import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import app from "../lib/firebase";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { cloudService } from "../services/cloudService";

const db = getFirestore(app);

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

    console.log("updateSpotifyAuth", data);

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
  const docRef = doc(db,"users", uid);
  const docSnap = await getDoc(docRef);

  const data = docSnap.exists() ? { ...docSnap.data() } : null;

  return data;
}

async function _createUserData(uid: string) {
  const usersRef = collection(db, "users");
  const result = await setDoc(doc(usersRef, uid), {
    uid,
    access_token: null,
    refresh_token: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return result;
}

async function _updateUserData(
  uid: string,
  access_token: string,
  refresh_token: string
) {
  const updateFields = refresh_token
    ? { access_token, refresh_token }
    : { access_token };
  
  const userRef = doc(db, "users", uid);
  const result = await updateDoc(userRef, {
    ...updateFields,
      updatedAt: serverTimestamp(),
  })

  return result;
}
