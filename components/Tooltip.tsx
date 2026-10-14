import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import styles from "./Tooltip.module.css";

/**
 * This is already included in the global context providers so should not be rendered again.
 */
const TooltipProvider = TooltipPrimitive.Provider;
