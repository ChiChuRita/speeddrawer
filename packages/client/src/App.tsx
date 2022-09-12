import { BrowserRouter, Route, Routes } from "react-router-dom";
import GamePage from "./routes/GamePage";
import MainPage from "./routes/MainPage";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/game" element={<GamePage />} />
                <Route path="*" element={<div>404</div>} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
