import mongoose from 'mongoose'

const dbConn = async () => {
    await mongoose.connect('mongodb://localhost:27017/Bookstore');
}


const Record = mongoose.model('Person1', new mongoose.Schema({
    title: String,
    pages: Number,
    progress: Number,
    completed: Boolean
}));


const addBook = (data) => {
    let combinedRecord = new Record({
        title: data.title,
        pages: data.pages,
        progress: data.progress,
        completed: data.completed
    })
    combinedRecord.save((err, res) => {
        if (err) throw err
        else {
            console.log(res)
        }
    })
}



export {
    dbConn,
    addBook
}