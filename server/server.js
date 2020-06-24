import express from "express";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import config from "../webpack.config.js";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import xml2js from "xml2js";


import { addBook, lookupBooks, dbConn, updateBooks } from "./mongo.js";

const __dirname = path.resolve(path.dirname(""));
const app = express();
app.use(webpackDevMiddleware(webpack(config)));
app.use(express.json());

app.get("/", (req, res) => res.send(`${__dirname}/dist`));
app.get("/config", (req, res) => {
  let _config = fs.readFileSync("./server/config.json", "utf-8");
  res.send(JSON.stringify(JSON.parse(_config)));
});
app.get("/shelves/:user", async (req, res) => {
  let request = await fetch(
    // `https://www.goodreads.com/shelf/list.xml?user_id=${process.env.GR_userID}&key=${process.env.GR_key}`
    `https://www.goodreads.com/review/list?v=2&id=${process.env.GR_userID}&per_page=200&key=${process.env.GR_key}`
  );
  let resp = await request.text();
  xml2js.parseString(resp, (err, result) => {
    console.log(result.GoodreadsResponse.reviews[0])
    // let shelves = result.GoodreadsResponse.shelves[0].user_shelf
    // console.log(shelves)
  })
  })
app.get("/bookstore/:user", async (req, res) => {
  let request = await fetch(
    `https://www.goodreads.com/review/list?v=2&id=${process.env.GR_userID}&per_page=200&key=${process.env.GR_key}`
  );
  let resp = await request.text();

  dbConn().then(() => {
    lookupBooks(req.params.user).then((databaseEntries) => {
      xml2js.parseString(resp, (err, result) => {
        // console.log(result.GoodreadsResponse.reviews)
        // console.log(result.GoodreadsResponse.Request)
        let goodreadsRaw = result.GoodreadsResponse.reviews[0].review;
        let goodreadsEntries = goodreadsRaw.map((grEntry, grIndex) => {
          let title = grEntry.book[0].title[0];
          let pages = parseFloat(grEntry.book[0].num_pages[0]);
          if (pages == 0) pages = 1;
          return {
            title,
            pages,
            progress: 0,
            completed: false,
          };
        });
        // console.log(goodreadsRaw)

        let missingEntries = goodreadsEntries.filter(
          (o1) => !databaseEntries.some((o2) => o1.title === o2.title)
        );
        if (missingEntries.length > 0) {
          missingEntries.forEach(async (entry) => {
            let pageValue;
            if (isNaN(entry.pages)) {
              pageValue = 1
            }
            else {
              pageValue = entry.pages
            }
            let newDoc = await addBook(
              {
                title: entry.title,
                pages: pageValue,
                progress: entry.progress,
                completed: entry.completed,
              },
              req.params.user
            );
            res.send(newDoc);
          });
        } else {
          res.send(databaseEntries);
        }
      });
    });
  });
});

app.post("/update/:user", (req, res) => {
  dbConn().then(() => {
    updateBooks(req.params.user, {
      title: req.body.title,
      pages: req.body.pages,
      progress: req.body.progress,
    });
    lookupBooks(req.params.user).then((bookList) => res.send(bookList));
  })
});

app.listen(9090, () => console.log("Listening..."));
