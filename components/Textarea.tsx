import React, { forwardRef, TextareaHTMLAttributes } from "react";
import inputStyles from "./Input.module.css";
import styles from "./Textarea.module.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  disableResize?: boolean;
  variant?: "default" | "clear";
}
