import { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Container,
  Accordion,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";

const removalLink = (
  <a
    href="https://www.spotify.com/account/apps/"
    target="_blank"
    className="text-accent"
  >
    Spotify Account/Apps
  </a>
);

const removalEmail = (
  <a
    href="mailto:contact@prb01.com?subject=Remove me from Synchtify"
    className="text-accent"
  >
    contact@prb01.com
  </a>
);

const HowTo = ({ modal, toggle, handleConnectSpotify }) => {
  return (
    <Modal
      isOpen={modal}
      toggle={toggle}
      size="lg"
      contentClassName="bg-primary border border-secondary text-text"
    >
      <ModalHeader toggle={toggle} tag="h1" className="text-primary btn-close-white">
        Help
      </ModalHeader>
      <ModalBody className="d-flex flex-column gap-3">
        <p className="my-4">
          This app will allow you to combine your favourite Spotify playlists into a
          new combined playlist. The combined playlist synchronises daily to ensure
          all the latest songs are included.
        </p>
        <div>
          <h3 className="">Quickstart Guide</h3>
          <div className="list">
            <div>
              Connect your{" "}
              <a href="#" className="text-accent" onClick={handleConnectSpotify}>
                Spotify account
              </a>
            </div>
            <Button
              color="secondary"
              className="btn-rounded d-flex gap-2 justify-content-center align-items-center container-sm py-4 py-sm-4 mt-1 mb-3 w-75"
              onClick={handleConnectSpotify}
            >
              <FontAwesomeIcon icon={faSpotify} />
              (re)Connect Spotify
            </Button>
            <div>Give your new Combined Playlist a name</div>
            <div>Select the playlists you want to combine</div>
            <div>Click "Save New Playlist"</div>
            <div>Done! Check Spotify to find your new combined playlist.</div>
          </div>
        </div>

        < hr className="my-5" style={{ width: "100%"}}/>

        <div className="d-flex flex-column gap-5">
          <div>
            <h3 className="">Can I combine more than 2 playlists?</h3>
            <p className="ms-2">
              Yes, you can combine up to 5! Use the +/- symbols next to the playlist
              drop-down to increase or decrease the amount of playlists available.
            </p>
          </div>

          <div>
            <h3 className="">How can I see my Combined Playlists?</h3>
            <p className="ms-2">
              Once you create your first Combined Playlist, it will be displayed
              below the "Create new combined playlist" section. Click on a Combined
              Playlist to reveal which playlists it is made up of. This also reveals
              the Delete button.
            </p>
          </div>

          <div>
            <h3 className="">How do I delete a Combined Playlist?</h3>
            <p className="ms-2">
              Click on your Combined Playlist to expand the drop-down. Then click on
              the red "Delete" button. <br />
              Note: Deleting ONLY affects the Combined Playlist. The original
              playlists remain intact.
            </p>
          </div>

          <div>
            <h3 className="">How do I delete my account & all data?</h3>
            <p className="ms-2">
              We're sorry to see you go! If you want to delete your account and all
              data, please follow these steps:
            </p>
            <div className="list">
              <div>Remove Synchtify from your {removalLink}</div>
              <div>
                Send an email to {removalEmail} with your account info asking to be
                removed
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <hr />
      <div className="d-flex justify-content-center align-items-center">
        <Button color="secondary" className="m-2 mb-4" onClick={toggle}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default HowTo;
