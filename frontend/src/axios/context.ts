import { createContext } from "react";
import type { AxiosContextValue } from "./types";

export const AxiosContext = createContext<AxiosContextValue | undefined>(undefined);