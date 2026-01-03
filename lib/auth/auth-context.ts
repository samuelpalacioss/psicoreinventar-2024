import { AsyncLocalStorage } from "async_hooks";
import { Role } from "@/types/enums";

interface AuthContext {
  role: Role;
}

export const authContext = new AsyncLocalStorage<AuthContext>();
