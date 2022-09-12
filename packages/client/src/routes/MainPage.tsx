import { Navigate } from "react-router-dom";

const MainPage = () => {
    return <Navigate to="/game" />; //while we don't have a main page, redirect to the game page
};

export default MainPage;
