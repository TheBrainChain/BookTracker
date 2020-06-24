import React, { useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Context } from "./Context";

import { Container, Navbar, Button } from "react-bootstrap";
const Header = () => {
  const { user, setUser } = useContext(Context);
  const { booksToDisplay, setBooksToDisplay } = useContext(Context);

  return (
    <Navbar expand="lg" variant="dark" bg="dark">
      {/* <Button onClick={() => setUser("Chris")}>Chris</Button>
      <Button onClick={() => setUser("Brittany")}>Brittany</Button> */}
      <Container>
        <Navbar.Brand style={{ margin: "0 auto" }} href="#">
          {user}'s Book List
        </Navbar.Brand>
      </Container>
      {/* <Button onClick={() => setBooksToDisplay("All")}>All</Button>
      <Button onClick={() => setBooksToDisplay("InProgress")}>InProgress</Button>
      <Button onClick={() => setBooksToDisplay("Complete")}>Complete</Button> */}
    </Navbar>
  );
};
export default Header;
