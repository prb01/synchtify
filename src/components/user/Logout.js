import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "redux/user";

export default function Logout(props) {
  const { firebase } = props;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        dispatch(logout());
        navigate("/");
      });
  }, [props.history]);

  return "Logging out…";
}
