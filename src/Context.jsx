import React, { useState } from "react";
export const Context = React.createContext(null);
export const MyProvider = (props) => {
  const [bookData, setBookData] = useState([]);
  const [user, setUser] = useState("Chris");
  const [booksToDisplay, setBooksToDisplay] = useState("All");
  return (
    <Context.Provider
      value={{
        bookData,
        setBookData,
        user,
        setUser,
        booksToDisplay,
        setBooksToDisplay,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};
