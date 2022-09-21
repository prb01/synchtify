import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";
import { useSelector } from "react-redux";
import {
  Nav as StrapNav,
  NavItem,
  Button,
  Navbar,
  Collapse,
  NavbarToggler,
  NavbarBrand,
} from "reactstrap";
import { spotifyLogin } from "../../lib/utils";
import { cloudService } from "../../services/cloudService";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import HowTo from "../dashboard/HowTo";

const logoSmall = "/img/synchtify-dark.svg";

const Nav = () => {
  const userData = useSelector((state) => state.user.data);
  const [collapsed, setCollapsed] = useState(true);
  const [navScroll, setNavScroll] = useState(false);
  const [modal, setModal] = useState(false);
  const router = useRouter();

  const toggle = () => setModal(!modal);

  // change NavBar to be sticky with bg color & smaller after scroll past
  const changeNav = () => {
    if (window.scrollY >= 40) {
      setNavScroll(true);
    } else {
      setNavScroll(false);
    }
  };

  useEffect(() => {
    changeNav();
    window.addEventListener("scroll", changeNav);
  }, []);

  // toggle burger menu on mobile
  const toggleNavbar = () => setCollapsed(!collapsed);

  // admin function to synch all combined playlists
  const handleRefreshCombinedPlaylists = async () => {
    await cloudService.adminRefreshAllCombinedPlaylists();
  };

  // admin function to back up combined playlists
  const handleBackupCombinedPlaylists = async () => {
    await cloudService.backupCombinedPlaylists();
  };

  // (re)Connect to Spotify (auth)
  const handleConnectSpotify = () => {
    spotifyLogin();
  };

  return (
    <header className="mb-6">
      <Navbar
        className={`align-items-center w-100 ${
          navScroll ? "navbar scroll" : "navbar"
        }`}
        dark
        fixed="top"
        container="sm"
        expand="sm"
      >
        <NavbarBrand href="/" className="me-auto">
          <img src={logoSmall} alt="SpotLislogo" style={{ width: "18%" }} />
        </NavbarBrand>
        <NavbarToggler onClick={toggleNavbar} className="me-2" />
        <Collapse isOpen={!collapsed} navbar>
          <StrapNav pills navbar className="pt-4 pb-4 px-3 ms-auto gap-3">
            {userData.admin && (
              <>
                <NavItem className="">
                  <Button
                    color="accent"
                    outline
                    className="btn-rounded container-sm py-4 py-sm-2"
                    onClick={handleRefreshCombinedPlaylists}
                  >
                    Refresh All
                  </Button>
                </NavItem>
                <NavItem className="">
                  <Button
                    color="accent"
                    outline
                    className="btn-rounded container-sm py-4 py-sm-2"
                    onClick={handleBackupCombinedPlaylists}
                  >
                    Back up
                  </Button>
                </NavItem>
              </>
            )}
            <NavItem className="">
              <Button
                color="secondary"
                outline
                className="btn-rounded d-flex gap-2 justify-content-center align-items-center container-sm py-4 py-sm-2"
                onClick={toggle}
              >
                <FontAwesomeIcon icon={faCircleQuestion} />
                Help
                <HowTo
                  modal={modal}
                  toggle={toggle}
                  handleConnectSpotify={handleConnectSpotify}
                />
              </Button>
            </NavItem>
            <NavItem className="">
              <Button
                color="accent"
                className="btn-rounded text-center px-4 container-sm py-4 py-sm-2"
                onClick={() => router.push("/logout")}
              >
                Logout
              </Button>
            </NavItem>
          </StrapNav>
        </Collapse>
      </Navbar>
    </header>
  );
};

export default Nav;
