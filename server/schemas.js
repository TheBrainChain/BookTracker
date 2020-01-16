import ap from 'apollo-server-express'
const {
    ApolloServer,
    gql
} = ap


const typeDefs = gql `
    type Book{
        title: String,
        pages: Int,
        progress: Int,
        completed: Boolean
    }
    type Query{
        getBooks: [Book]
    }
    type Mutation{
        addBook(title: String, pages: Int, progress: Int, completed: Boolean): Book
    }
`;

const books = [{
    title: 'test',
    pages: 12,
    progress: 10,
    completed: false
}]


// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        getBooks: () => books
    },
    Mutation: {
        addBook: async (_, args) => {
            try {
                let response = Book.create(args);
                return response;
            } catch (e) {
                return e.message
            }
        }
    }
};
const server = new ApolloServer({
    typeDefs,
    resolvers
});
export default server