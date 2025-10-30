import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Container from "@/components/container";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Container>
        <div className="text-center">
          <h1 className="text-9xl font-bold text-indigo-600">404</h1>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Page not found
          </h2>
          <p className="mt-6 text-base leading-7 text-gray-600 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. Perhaps you've mistyped the URL or
            the page has been moved.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "default" }), "bg-indigo-600 text-white")}
            >
              Go back home
            </Link>
            <Link
              href="/specialists"
              className={cn(buttonVariants({ variant: "outline" }), "gap-x-1")}
            >
              Find a therapist{" "}
              <span className="font-semibold" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

