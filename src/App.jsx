import React, {
  useContext,
  useState,
  useEffect,
} from 'react';
import Header from './Header'
import { Context } from './Context'
import {
  Table, Form, Container
} from 'react-bootstrap'
import ApolloClient from 'apollo-boost';

var parseString = require('xml2js').parseString;
const client = new ApolloClient();
import { gql } from "apollo-boost";

export default function App() {
  const { bookData, setBookData } = useContext(Context);
  const [totalReadPages, settotalReadPages] = useState(0)
  const [totalPages, settotalPages] = useState(0)
  const [dayCount, setDayCount] = useState(1);
  const [weekCount, setWeekCount] = useState(1);
  const [configuration, setConfig] = useState()
  //Pull data from GR and compare it to local db
  useEffect(() => {
    (async () => {
      let req = await fetch('/config')
      let config = await req.json();
      setConfig(config)
      let route = `https://www.goodreads.com/review/list?v=2&id=${config}&key=OSgi8IpmqYIL5V6CNUT68Q`

      const proxyurl = "https://cors-anywhere.herokuapp.com/";
      let req1 = await fetch(proxyurl + route)
      let resp = await req1.text()
      parseString(resp, (err, result) => {
        let entries = result.GoodreadsResponse.reviews[0].review;
        let dataToSend = entries.map(entry => {
          let pages = parseFloat(entry.book[0].num_pages[0])
          let title = entry.book[0].title[0]
          if (Number.isNaN(pages)) { pages = 999 };
          return {
            pages,
            title,
          }
        })
        fetch('/bookstore', {
          method: 'POST',
          body: JSON.stringify(dataToSend),
          headers: {
            'Content-Type': 'application/json'
          },
        })
      })
      await requestBooksFromDS('all')
      await gettotalReadPagesRead()
    })()
    timeCalculations()
  }, [])

  useEffect(() => {
    client
      .query({
        query: gql`
        {
          hello
        }
      `
      })
      .then(result => console.log(result));
  }, [])

  const requestBooksFromDS = async (type) => {
    let req = await fetch(`/bookstore/${type}`);
    let res = await req.json();
    if (type != 'all') {
      setBookData(res);
    }
    else {
      let allBooks = res.InProgress.concat(res.Completed)
      setBookData(allBooks)
    }
  }

  const gettotalReadPagesRead = async () => {
    let req = await fetch(`/bookstore/all`);
    let res = await req.json();
    let progress = Object.values(res).map(vals => vals.map(x => x.progress))
    let goal = Object.values(res).map(vals => vals.map(x => x.pages))
    let totalProgress = progress.flat().reduce((total, num) => total + num)
    let totalGoal = goal.flat().reduce((total, num) => total + num)
    settotalReadPages(totalProgress)
    settotalPages(totalGoal)
  }

  const timeCalculations = () => {
    let now = new Date();
    let start = new Date(now.getFullYear(), 0, 0);
    let diff = now - start;
    let oneDay = 1000 * 60 * 60 * 24;
    let day = Math.floor(diff / oneDay);
    let week = day / 7;
    setDayCount(day);
    setWeekCount(week);
  }

  const updatePage = async (book, page) => {
    let update = await fetch('/update', {
      method: 'POST',
      body: JSON.stringify({
        title: book,
        progress: parseFloat(page.target.value)
      }),
      headers: {
        'Content-Type': 'application/json'
      },

    })
    let response = await update.json()
    setBookData(response.InProgress)
    gettotalReadPagesRead()
  }

  return (
    <div className={true ? 'background-red' : 'background-blue'}>
      <Header name={configuration ? configuration.person : ""}></Header>
      <Container >
        <Table striped bordered hover responsive variant='dark' size="sm">
          <thead>
            <tr>
              <th>Title</th>
              <th>Currently on</th>
              <th>Total pages</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {bookData.map(book => {
              return (
                <tr style={{
                  textDecoration: book.completed ? 'line-through' : 'none'
                }}>
                  <td>{book.title}</td>
                  <td>
                    <Form.Control size="sm" type="text" placeholder={book.progress}
                      onChange={val => updatePage(book.title, val)}
                    >
                    </Form.Control>

                  </td>
                  <td>
                    {book.pages}
                  </td>
                  <td>{(book.progress / book.pages * 100).toFixed(2)}</td>
                </tr>
              )
            })}

            <tr className="bg-primary" style={{ color: 'black' }}>
              <td>Total</td>
              <td>{totalReadPages}</td>
              <td>{totalPages}</td>
              <td>{((totalReadPages / totalPages) * 100).toFixed(2)}</td>
            </tr>

            <tr className="bg-primary" style={{ color: 'black' }}>
              <td>Annual Goal</td>
              <td>{totalReadPages}</td>
              <td>{10000}</td>
              <td>{((totalReadPages / 10000) * 100).toFixed(4)}</td>
            </tr>
            <tr className="bg-primary" style={{ color: 'black' }}>
              <td>Monthly Goal</td>
              <td>{(totalReadPages / dayCount * 30).toFixed(3)}</td>
              <td>{(10000 / 12).toFixed(3)}</td>
              <td>{((totalReadPages / dayCount * 30) / (10000 / 12) * 100).toFixed(4)}</td>
            </tr>
            <tr className="bg-primary" style={{ color: 'black' }}>
              <td>Weekly Goal</td>
              <td>{(totalReadPages / weekCount).toFixed(3)}</td>
              <td>{(10000 / 52).toFixed(3)}</td>
              <td>{((totalReadPages / weekCount) / (10000 / 52)).toFixed(4) * 100}</td>
            </tr>
            <tr className="bg-primary" style={{ color: 'black' }}>
              <td>Daily Goal</td>
              <td>{(totalReadPages / dayCount).toFixed(3)}</td>
              <td>{(10000 / 366).toFixed(3)}</td>
              <td>{((totalReadPages / dayCount) / (10000 / 366)).toFixed(4) * 100}</td>
            </tr>
          </tbody>
        </Table>
      </Container>
    </div>
  );
}
