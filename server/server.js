import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from "webpack-dev-middleware";
import config from "../webpack.config.js"
import path from 'path'
import fs from 'fs'
import server from './schemas.js'
import {
    dbConn,
    addBook,
} from './mongo.js'
const __dirname = path.resolve(path.dirname(""));
const app = express();
const compiler = webpack(config);

server.applyMiddleware({
    app
});

dbConn();
// addBook({
//     title: 'test',
//     pages: 12,
//     progress: 11,
//     completed: false
// });
app.use(webpackDevMiddleware(compiler));
app.use(express.json())


app.get('/', (req, res) => {
    res.send(`${__dirname}/dist`)
})


app.post('/bookstore', (req, res) => {
    let currentDataStore = fs.readFileSync('./server/datastore.json', 'utf-8')
    let parsedDatastore = JSON.parse(currentDataStore);
    let dsEntries = Object.keys(parsedDatastore).map(key => {
        return parsedDatastore[key].map(entry => entry.title)
    })
    let inProgress = parsedDatastore.InProgress;
    req.body.forEach(entry => {
        if (!dsEntries.flat().includes(entry.title)) {
            entry['progress'] = 0;
            entry['completed'] = false;
            inProgress.push(entry)
        }
    })
    parsedDatastore.InProgress = inProgress;
    fs.writeFileSync('./server/datastore.json', JSON.stringify(parsedDatastore), 'utf-8')
})

app.get('/config', (req, res) => {
    let _config = fs.readFileSync('./server/config.json', 'utf-8')
    let config = JSON.parse(_config)
    let id = config.People[Object.keys(config.People)[1]]
    console.log(id)
    res.send(JSON.stringify(id))
})

app.get('/bookstore/:goal', (req, res) => {
    let data = fs.readFileSync('./server/datastore.json', 'utf-8')
    let parsedData = JSON.parse(data);
    if (req.params.goal == 'Completed') {
        res.send(parsedData.Completed)
    }
    if (req.params.goal == 'InProgress') {
        res.send(parsedData.InProgress)
    } else {
        res.send(parsedData)
    }
})

app.post('/update', (req, res) => {
    let data = fs.readFileSync('./server/datastore.json', 'utf-8')
    let parsedData = JSON.parse(data);
    let newBooks = parsedData.InProgress.map(books => {
        if (books.title == req.body.title) {
            books.progress = req.body.progress
            if (req.body.progress == books.pages) {
                books.completed = true
            } else {
                books.completed = false;
            }
        }
        return books;
    })
    let writeAgain = true;
    parsedData.InProgress = newBooks;
    if (writeAgain) {
        writeAgain = false
        fs.writeFileSync('./server/datastore.json', JSON.stringify(parsedData), 'utf-8', () => {
            writeAgain = true;
        })
    }
    res.send(parsedData);
})

app.listen(9090)