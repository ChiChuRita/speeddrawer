import React from "react";
import MyCanvas from "../components/MyCanvas";

const GamePage = () => {
    return (
        <div className="flex h-screen w-screen flex-row items-center justify-center">
            <MyCanvas width={160} height={160} />
        </div>
    );
};

export default GamePage;
