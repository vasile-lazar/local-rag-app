import { useContext } from "react";
import { AxiosContext } from "./context";

export function useAxios() {
    const ctx = useContext(AxiosContext);
    if (!ctx) throw new Error("useAxios must be used within an AxiosProvider");
    return ctx;
}