import Link from "next/link";
import CommonHead from "../components/CommonHead";
import { GetStaticProps } from "next";

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {},
  };
};

const Home = () => {
  return (
    <>
      <CommonHead />
      <div
        className="vw-100 h-100 min-vh-100 d-flex justify-content-center align-items-center homepage-bg p-2 overflow-hidden"
        style={{ height: "100%" }}
      >
        <div className="d-flex flex-column text-center justify-content-center">
          <div className="position-relative">
            <p className="text-text logo-large text-shadow mb-n4 mb-xl-n5">
              <span className="logo-left">
                <u>Synch</u>
              </span>
              <span className="logo-right text-secondary">
                <u>tify</u>
              </span>
            </p>
          </div>
          <div className="position-relative">
            <p className="text-text font-weight-bold lh-sm text-shadow headline blur-in">
              Combine & Synch your favourite Spotify playlists
            </p>
          </div>
          <div className="mt-4">
            <div className="mb-2">
              <Link href="/login">
                <a
                  role="button"
                  className="opacity-0 btn-lg btn-accent text-primary text-decoration-none blur-in font-weight-bold p-2 px-5"
                >
                  Sign Up
                </a>
              </Link>
            </div>
            <div className="d-sm-none mt-4">
              <Link href="/login">
                <a
                  role="button"
                  className="opacity-0 btn-lg btn-text text-primary text-decoration-none blur-in font-weight-bold p-2 px-5"
                >
                  Login
                </a>
              </Link>
            </div>

            <p className="text-text d-none d-sm-block opacity-0 blur-in">
              or{" "}
              <Link href="/login">
                <a className="text-text">
                  <u>login</u>
                </a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
