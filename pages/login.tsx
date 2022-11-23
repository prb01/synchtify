import { Form, FormGroup, Row, Col, Input, Label, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faArrowLeft, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { useRouter } from "next/router";
import Script from "next/script";
import { useAuth } from "../context/Auth";
import firebase from "../lib/firebase";
import CommonHead from "../components/CommonHead";
import Head from "next/head";

const componentLoginFroms = {
  login: LoginForm,
  email: EmailLogin,
};

export default function Login() {
  const { user } = useAuth();
  const [form, setForm] = useState<string>("login");
  const router = useRouter();
  const Component = componentLoginFroms[form];

  // if user exists, redirect to home
  useEffect(() => {
    if (user) {
      const returnTo = "/dashboard";

      router.push(returnTo);
    }
  }, [user]);

  return (
    <>
      <CommonHead />
      <Head>
        <title key="title">Synchtify | Login</title>
      </Head>
      <div className="vh-100 vw-100 d-flex justify-contents-center align-items-center">
        <div className="login-bg d-none d-md-block"></div>
        <div className="d-flex justify-content-center align-items-center container-fluid bg-white w-100 h-100">
          <Col
            md={8}
            className="d-flex flex-column justify-contents-center p-5 gap-2"
          >
            <Row>
              <h3 className="text-primary fw-bold">Log in or create an account</h3>
            </Row>
            <Row className="mb-5">
              <p>
                Quickly get started by signing in using your existing accounts.{" "}
                <i className="blockquote-footer">
                  (Note this does not need to be the same email as your Spotify
                  account.)
                </i>
              </p>
            </Row>
            <Row>
              <Component setForm={setForm} />
            </Row>
          </Col>
        </div>
      </div>
    </>
  );
}

function LoginForm({ setForm }) {
  // https://stackoverflow.com/questions/47532134/changing-the-domain-shown-by-google-account-chooser

  const handleLogin = async (provider) => {
    try {
      return await firebase.auth().signInWithPopup(provider);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  const handleGoogleLogin = () => {
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    return handleLogin(googleProvider);
  };

  const handleFacebookLogin = () => {
    const facebookProvider = new firebase.auth.FacebookAuthProvider();
    return handleLogin(facebookProvider);
  };

  const handleEmailLogin = () => {
    setForm("email");
  };

  const privacy = (
    <a
      href="https://www.iubenda.com/privacy-policy/68367909"
      className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe "
      title="Privacy Policy"
    >
      Privacy Policy
    </a>
  );

  const TermsPrivacy = () => {
    return (
      <>
        <Script src="https://cdn.iubenda.com/iubenda.js" />
        <p className="small text-muted font-weight-light">
          By proceeding, you are agreeing to the {privacy}.
        </p>
      </>
    );
  };

  return (
    <Form>
      <FormGroup>
        <TermsPrivacy />
      </FormGroup>
      <Row className="d-flex justify-content-center align-items-center">
        {/* <Col md={6} className="d-flex justify-content-center"> */}
        <FormGroup className="d-flex justify-content-center">
          <Button
            className="btn-block btn-light d-flex flex-row justify-content-around align-items-center w-100"
            color="gg-grey"
            onClick={handleGoogleLogin}
          >
            <Col md={1}>
              <FontAwesomeIcon icon={faGoogle} />
            </Col>
            <Col>Login with Google</Col>
          </Button>
        </FormGroup>
        {/* </Col> */}
        {/* <Col md={6} className="d-flex justify-content-center"> */}
        <FormGroup className="d-flex justify-content-center">
          {/* for some reason btn-primary does not work? */}
          <Button
            className="btn-block d-flex flex-row justify-content-around align-items-center w-100"
            color="fb-blue"
            onClick={handleFacebookLogin}
          >
            <Col md={1}>
              <FontAwesomeIcon icon={faFacebook} />
            </Col>
            <Col>Login with Facebook</Col>
          </Button>
        </FormGroup>
        {/* </Col> */}
        <FormGroup className="d-flex justify-content-center">
          <Button
            className="btn-block d-flex flex-row justify-content-around align-items-center w-100"
            color="secondary"
            onClick={handleEmailLogin}
          >
            <Col md={1}>
              <FontAwesomeIcon icon={faEnvelope} />
            </Col>
            <Col>Login with Email</Col>
          </Button>
        </FormGroup>
      </Row>
    </Form>
  );
}

function EmailLogin({ setForm }) {
  // Configure FirebaseUI.
  const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: "popup",
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    signInSuccessUrl: "/dashboard",
    signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
  };

  console.log("IN HERE");

  return (
    <div className="d-flex flex-column gap-2">
      <Button
        className="btn-block d-flex flex-row"
        color="none"
        onClick={() => setForm("login")}
      >
        <Col md={1}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </Col>
        <Col className="ms-2 text-start">Return</Col>
      </Button>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </div>
  );
}
