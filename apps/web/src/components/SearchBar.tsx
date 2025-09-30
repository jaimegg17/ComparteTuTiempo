"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import { Search } from "iconoir-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  width?: string | number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
}

export function SearchBar({ 
  placeholder = "Search", 
  onSearch,
  width = { xs: 200, md: 360 }
}: SearchBarProps) {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch?.(newValue);
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        width: width,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: "12px",
          display: "flex",
          alignItems: "center",
          pointerEvents: "none",
          zIndex: 1,
          color: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <Search width={18} height={18} strokeWidth={2} />
      </Box>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        style={{
          width: "100%",
          height: "40px",
          paddingLeft: "40px",
          paddingRight: "16px",
          fontSize: "14px",
          border: "none",
          outline: "none",
          borderRadius: 8,
          backgroundColor: "#eef2f1",
          color: "rgba(0, 0, 0, 0.8)",
          transition: "all 0.2s ease",
        }}
        onFocus={(e) => {
          e.target.style.backgroundColor = "#e3e9e8";
          e.target.style.boxShadow = "0 0 0 2px rgba(0, 0, 0, 0.1)";
        }}
        onBlur={(e) => {
          e.target.style.backgroundColor = "#eef2f1";
          e.target.style.boxShadow = "none";
        }}
      />
    </Box>
  );
}
