import React, { useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InlineTagEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function InlineTagEditor({ tags, onChange }: InlineTagEditorProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleRemove = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = inputValue.trim().replace(/^,|,$/g, "");
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove last tag if input is empty
      handleRemove(tags.length - 1);
    }
  };

  return (
    <div 
      className={`flex flex-wrap gap-1.5 p-2 rounded-md border transition-colors max-h-32 overflow-y-auto ${
        isFocused ? "border-primary/50 bg-background shadow-sm shadow-primary/10" : "border-transparent hover:border-border/50 hover:bg-muted/30"
      }`}
      onClick={(e) => {
        const input = e.currentTarget.querySelector("input");
        if (input) input.focus();
      }}
    >
      <AnimatePresence>
        {tags.map((tag, i) => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, width: 0, overflow: 'hidden' }}
            transition={{ duration: 0.15 }}
          >
            <Badge
              variant="secondary"
              className="text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 flex items-center gap-1 pl-2.5 pr-1 py-0.5 group cursor-default transition-colors shadow-none"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(i);
                }}
                className="hover:bg-primary/20 rounded-full p-0.5 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="flex items-center min-w-[60px] flex-1 mt-0.5">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (inputValue.trim()) {
              const newTag = inputValue.trim().replace(/^,|,$/g, "");
              if (newTag && !tags.includes(newTag)) {
                onChange([...tags, newTag]);
                setInputValue("");
              }
            }
          }}
          className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground w-full min-w-0"
          placeholder={tags.length === 0 ? "Add tags..." : "Type & press enter..."}
        />
      </div>
    </div>
  );
}
