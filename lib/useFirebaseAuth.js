import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import firebase from "./firebase";
import { fetchUser } from "../redux/user";

export default function useFirebaseAuth(onLogin) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();

  const storeUserData = (user) => {
    const providerData = user.providerData[0];
    const userData = { ...providerData, uid: user.uid };

    dispatch(fetchUser(userData));
  };

  const authStateChanged = async (user) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    setUser(user);
    user && storeUserData(user);

    setIsLoading(false);
    setIsLoaded(true);
  };

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(authStateChanged);

    return () => unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isLoaded,
  };
}