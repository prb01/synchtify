import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logout } from "../redux/user";
import firebase from "../lib/firebase";

export default function Logout() {
  const router = useRouter();
  const dispatch = useDispatch();

  firebase
    .auth()
    .signOut()
    .then(() => {
      dispatch(logout());
      router.push("/");
    });

  return "Logging out…";
}
