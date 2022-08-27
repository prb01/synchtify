import { useSelector } from "react-redux";
import { Container } from "reactstrap";
import ComboPlaylist from "./ComboPlaylist";

const ListOfComboPlaylists = ({ combinedPlaylists }) => {
  const {
    data: spotifyUserData,
    isLoaded: spotifyUserIsLoaded,
    hasErrors: spotifyUserHasErrors,
  } = useSelector((state) => state.spotifyUser);

  if (!combinedPlaylists || combinedPlaylists.length === 0) return null;

  return (
    <>
      {!spotifyUserIsLoaded && "Form loading..."}
      {spotifyUserHasErrors && `Error Loading...`}
      {spotifyUserIsLoaded && (
        <Container className="p-3 my-3 border border-secondary form-rounded text-text d-grid gap-3">
          <h2 className="text-center mb-4">
            {spotifyUserData?.display_name}'s Combined Playlists
          </h2>
          {combinedPlaylists.map((combinedPlaylist) => (
            <ComboPlaylist
              key={combinedPlaylist.id}
              combinedPlaylist={combinedPlaylist}
              idx={combinedPlaylist.id}
            />
          ))}
        </Container>
      )}
    </>
  );
};

export default ListOfComboPlaylists;
