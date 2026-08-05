import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  iconClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { className, containerClassName, iconClassName, placeholder, ...props },
    ref,
  ) => {
    return (
      <div
        className={cn(
          "relative flex items-center w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          containerClassName,
        )}
      >
        <Search
          className={cn(
            "mr-2 h-4 w-4 shrink-0 opacity-50 text-muted-foreground",
            iconClassName,
          )}
        />
        <input
          {...props}
          ref={ref}
          placeholder={placeholder}
          className={cn(
            "flex w-full bg-transparent p-0 text-sm placeholder:text-muted-foreground outline-none border-none disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        />
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
