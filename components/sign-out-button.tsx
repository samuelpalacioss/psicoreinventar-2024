"use client";
import { Button } from "./ui/button";
import { signOutAction } from "@/actions/auth";

export default function SignOutButton() {
  return <Button onClick={() => signOutAction()}>Sign Out</Button>;
}
