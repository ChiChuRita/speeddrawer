import React from "react";
import MyCanvas from "../components/MyCanvas";
import RemoteCanvas from "../components/RemoteCanvas";

const GamePage = () => {
    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center">
            <MyCanvas width={32} height={32} />
        </div>
    );
};

export default GamePage;
