import React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import styles from "./Separator.module.css";

interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
  decorative?: boolean;
}