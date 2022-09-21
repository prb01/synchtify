import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";

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
      <ModalHeader toggle={toggle} tag="h2" className="text-primary btn-close-white">
        Help
      </ModalHeader>
      <ModalBody>
        <p className="mb-4">
          This app will allow you to combine your favourite Spotify playlists into a
          new combined playlist. The combined playlist synchronises daily to ensure
          all the latest songs are included.
        </p>
        <h3>Quickstart Guide</h3>
        <div className="list">
          <div>
            Connect your{" "}
            <a href="#" className="text-accent" onClick={handleConnectSpotify}>
              Spotify account
            </a>
          </div>
          <div>Give your new Combined Playlist a name</div>
          <div>Select the playlists you want to combine</div>
          <div>Click "Save New Playlist"</div>
          <div>Done! Check Spotify to find your new combined playlist.</div>
        </div>

        <h3 className="mt-5">Can I combine more than 2 playlists?</h3>
        <p>Yes, you can combine up to 5!</p>
        <p>
          Use the +/- symbols next to the playlist drop-down to increase or decrease
          the amount of playlists available.
        </p>

        <h3 className="mt-5">How can I see my Combined Playlists?</h3>
        <p>
          Once you create your first Combined Playlist, it will be displayed below
          the "Create new combined playlist" section.
        </p>
        <p>
          Click on a Combined Playlist to reveal which playlists it is made up of.
          This also reveals the Delete button.
        </p>

        <h3 className="mt-5">How do I delete a Combined Playlist?</h3>
        <p>
          Click on your Combined Playlist to expand the drop-down. Then click on the
          red "Delete" button.
        </p>
        <p>
          Note: Deleting ONLY affects the Combined Playlist. The original playlists
          remain intact.
        </p>

        <h3 className="mt-5">How do I delete my account & all data?</h3>
        <p>
          We're sorry to see you go! If you want to delete your account and all data,
          please follow these steps:
        </p>
        <div className="list">
          <div>Remove Synchtify from your {removalLink}</div>
          <div>
            Send an email to {removalEmail} with your account info asking to be
            removed
          </div>
        </div>
      </ModalBody>
      <hr />
      <div className="d-flex justify-content-end align-items-center">
        <Button color="secondary" className="m-2" onClick={toggle}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default HowTo;
