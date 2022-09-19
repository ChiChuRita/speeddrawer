import React from "react";
import MyCanvas from "../components/MyCanvas";
import RemoteCanvas from "../components/RemoteCanvas";

const GamePage = () => {
    return (
        <div className="flex h-screen w-screen flex-row items-center justify-center">
            <MyCanvas width={16} height={16} />
        </div>
    );
};

export default GamePage;
