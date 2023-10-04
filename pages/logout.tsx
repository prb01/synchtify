import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logout } from "../redux/user";
import app from "../lib/firebase";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "../context/Auth";

const auth = getAuth(app);

export default function Logout() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { clear } = useAuth();

  signOut(auth)
    .then(() => {
      clear();
      dispatch(logout());
      router.push("/");
    });

  return "";
}
