import { AsyncLocalStorage } from "async_hooks";
import { Role } from "@/src/types";

interface AuthContext {
  role: Role;
}

export const authContext = new AsyncLocalStorage<AuthContext>();
