"use client";
import { SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { APP_URL } from "@/constants";
import { Button } from "@/components/ui/button";

export const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const query = searchParams.get("query") || "";
  const [value, setValue] = useState(query);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = new URL("/search", APP_URL);
    const newQuery = value.trim();

    // Add the search query parameter
    if (newQuery !== "") {
      url.searchParams.set("query", newQuery);
    }

    // Preserve the category filter if it exists
    if (categoryId) {
      url.searchParams.set("categoryId", categoryId);
    }

    setValue(newQuery);

    router.push(url.toString());
  };

  return (
    <form className="flex w-full max-w-[600px]" onSubmit={handleSearch}>
      <div className="relative w-full">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="text"
          placeholder="Search"
          className="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none border-r-none focus:border-blue-500 transition-all"
        />
        {value && (
          <Button
            type="button"
            variant={"ghost"}
            size={"icon"}
            onClick={() => setValue("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
          >
            <XIcon className="text-gray-500" />
          </Button>
        )}
      </div>
      <button
        disabled={!value.trim()}
        type="submit"
        className="px-5 py-2.5 bg-gray-100 border-l-0 rounded-r-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SearchIcon className="size-5" />
      </button>
    </form>
  );
};
