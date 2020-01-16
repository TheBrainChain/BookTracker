import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Container, Navbar } from 'react-bootstrap'
const Header = (props) => {
    return (
        <Navbar expand="lg" variant="light" bg="light">
            <Container>
                <Navbar.Brand style={{ margin: "0 auto" }} href="#">{props.name}'s Book List</Navbar.Brand>
            </Container>
        </Navbar>
    )
}
export default Header;