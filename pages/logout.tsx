import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logout } from "../redux/user";
import firebase from "../lib/firebase";
import { useAuth } from "../context/Auth";

export default function Logout() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { clear } = useAuth();

  firebase
    .auth()
    .signOut()
    .then(() => {
      clear();
      dispatch(logout());
      router.push("/");
    });

  return "";
}
