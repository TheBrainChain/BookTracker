import React, { useContext, useState, useEffect } from "react";
import Header from "./Header";
import { Context } from "./Context";
import { Table, Form, Container } from "react-bootstrap";
import uuid from "uuid";

export default function App() {
  const { booksToDisplay, user, bookData, setBookData } = useContext(Context);
  const [totalReadPages, settotalReadPages] = useState(0);
  const [dayCount, setDayCount] = useState(1);
  const [weekCount, setWeekCount] = useState(1);

  useEffect(() => {
    let now = new Date();
    let start = new Date(now.getFullYear(), 0, 0);
    let day = Math.floor((now - start) / 86400000);
    setDayCount(day);
    setWeekCount(day / 7);
  }, []);

  //Pull data from GR and compare it to local db
  useEffect(() => {
    getDataFromDB();
  }, [user]);

  // useEffect(() => {
  //   getDataFromDB();
  // }, [booksToDisplay]);

  const getDataFromDB = async () => {
    let req = await fetch(`/bookstore/${user}`);
    let allBooks = await req.json();
    allBooks.sort((a, b) =>
      a.progress / a.pages > b.progress / b.pages
        ? 0
        : b.progress / b.pages
        ? -1
        : 1
    );
    if (booksToDisplay == "All") {
      let totalProgress = allBooks
        .map((e) => e.progress)
        .flat()
        .reduce((total, num) => total + num);
      settotalReadPages(totalProgress);
      setBookData(allBooks);
    } else if (booksToDisplay == "InProgress") {
      let filteredBooks = allBooks.filter((book) => book.completed == false);
      let totalProgress = filteredBooks
        .map((e) => e.progress)
        .flat()
        .reduce((total, num) => total + num);
      settotalReadPages(totalProgress);
      setBookData(filteredBooks);
    } else if (booksToDisplay == "Complete") {
      let filteredBooks = allBooks.filter((book) => book.completed == true);
      let totalProgress = filteredBooks
        .map((e) => e.progress)
        .flat()
        .reduce((total, num) => total + num);
      settotalReadPages(totalProgress);
      setBookData(filteredBooks);
    }
  };

  const updatePage = async (book, page, type) => {
    let body;
    if (type == "current") {
      body = JSON.stringify({
        title: book.title,
        progress: parseFloat(page.target.value),
        pages: book.pages,
      });
    } else {
      body = JSON.stringify({
        title: book.title,
        progress: book.progress,
        pages: parseFloat(page.target.value),
      });
    }
    let update = await fetch(`/update/${user}`, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    });
    let response = await update.json();
    response.sort((a, b) =>
      a.progress / a.pages > b.progress / b.pages
        ? 0
        : b.progress / b.pages
        ? -1
        : 1
    );
    setBookData(response);
    getDataFromDB();
  };

  return (
    <div>
      <Header />
      <Container fluid>
        <Table striped bordered hover responsive variant="dark" size="sm">
          <thead>
            <tr>
              <th>Title</th>
              <th>Currently on</th>
              <th>Total pages</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {bookData.map((book) => {
              return (
                <tr
                  key={uuid.v4()}
                  style={{
                    textDecoration: book.completed ? "line-through" : "none",
                  }}
                >
                  <td>{book.title}</td>
                  <td>
                    <Form.Control
                      size="sm"
                      type="text"
                      placeholder={book.progress}
                      onBlur={(val) => updatePage(book, val, "current")}
                    ></Form.Control>
                  </td>
                  <td>
                    <Form.Control
                      size="sm"
                      type="text"
                      placeholder={book.pages}
                      onBlur={(val) => updatePage(book, val, "total")}
                    ></Form.Control>
                  </td>
                  <td>{((book.progress / book.pages) * 100).toFixed(2)}</td>
                </tr>
              );
            })}

            <tr className="bg-secondary" style={{ color: "black" }}>
              <td>Current</td>
              <td>{totalReadPages}</td>
              <td>{((10000 / 365) * dayCount).toFixed(2)}</td>
              <td>
                {(totalReadPages / dayCount / (10000 / 366)).toFixed(2) * 100}
              </td>
            </tr>
            <tr className="bg-primary" style={{ color: "black" }}>
              <td>Annual Goal</td>
              <td>{totalReadPages}</td>
              <td>{10000}</td>
              <td>{((totalReadPages / 10000) * 100).toFixed(2)}</td>
            </tr>
            <tr className="bg-primary" style={{ color: "black" }}>
              <td>Monthly Goal</td>
              <td>{((totalReadPages / dayCount) * 30).toFixed(2)}</td>
              <td>{(10000 / 12).toFixed(2)}</td>
            </tr>
            <tr className="bg-primary" style={{ color: "black" }}>
              <td>Weekly Goal</td>
              <td>{(totalReadPages / weekCount).toFixed(2)}</td>
              <td>{(10000 / 52).toFixed(2)}</td>
            </tr>
            <tr className="bg-primary" style={{ color: "black" }}>
              <td>Daily Goal</td>
              <td>{(totalReadPages / dayCount).toFixed(2)}</td>
              <td>{(10000 / 365).toFixed(2)}</td>
            </tr>
          </tbody>
        </Table>
      </Container>
    </div>
  );
}
