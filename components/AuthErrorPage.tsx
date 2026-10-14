import React from "react";
import { AlertTriangle } from "lucide-react";
import styles from "./AuthErrorPage.module.css";

export interface AuthErrorPageProps {
  /**
   * The title of the error message
   */
  title?: string;