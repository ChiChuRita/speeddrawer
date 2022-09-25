import create from "zustand";
interface GameStore {
    user: string | null;
}

let intervalFunction: any;

const useGameStore = create<GameStore>((set, get) => ({
    user: null,
}));

export default useGameStore;
