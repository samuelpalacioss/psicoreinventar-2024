"use client";

import React from "react";

export default function Newsletter() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log("Form submitted");
    // Add newsletter subscription logic here
  };

  return (
    <div>
      <h3 className="text-sm/6 font-semibold text-white">Subscribe to our newsletter</h3>
      <p className="mt-2 text-sm/6 text-gray-300">
        The latest news, articles, and resources, sent to your inbox weekly.
      </p>
      <form className="mt-6 sm:flex sm:max-w-md" onSubmit={handleSubmit}>
        <label htmlFor="email-address" className="sr-only">
          Email address
        </label>
        <input
          id="email-address"
          name="email-address"
          type="email"
          required
          placeholder="Enter your email"
          autoComplete="email"
          className="w-full min-w-0 rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-solid outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-solid focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:w-64 sm:text-sm/6 xl:w-full"
        />
        <div className="mt-4 sm:ml-4 sm:mt-0 sm:shrink-0">
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Subscribe
          </button>
        </div>
      </form>
    </div>
  );
}
