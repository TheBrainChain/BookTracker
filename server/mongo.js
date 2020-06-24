import mongoose from "mongoose";

const dbConn = async () => {
  try {
    await mongoose.connect('mongodb://mongo:27017/Bookstore?authSource=admin', 
    {
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASS,
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
  }
  catch(err){
    console.log(err)
  }
};

const bookSchema = new mongoose.Schema({
  title: String,
  pages: Number,
  progress: Number,
  completed: Boolean,
});

const addBook = async (data, user) => {
  const Book = mongoose.model(user, bookSchema);
  let combinedRecord = new Book({
    title: data.title,
    pages: data.pages,
    progress: data.progress,
    completed: data.completed,
  });
  let newDoc = await combinedRecord.save();
  return lookupBooks(user)
};

const lookupBooks = (user) => {
  const Book = mongoose.model(user, bookSchema);
  return Book.find().select("-_id -__v");
};

const updateBooks = async (user, entry) => {
  const Book = mongoose.model(user, bookSchema);
  await Book.findOneAndUpdate({title: entry.title}, {
    pages: entry.pages,
    progress: entry.progress
  })
}


export { addBook, lookupBooks, dbConn, updateBooks };
