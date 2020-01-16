import React, { useState } from "react";
export const Context = React.createContext(null);
export const MyProvider = (props) => {
    const [bookData, setBookData] = useState([])
    return (
        <Context.Provider value={{
            bookData, setBookData
        }}>{props.children}</Context.Provider>
    )
}