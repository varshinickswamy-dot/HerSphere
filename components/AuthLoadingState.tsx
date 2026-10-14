import React from "react";
import { Skeleton } from "./Skeleton";
import { Lock } from "lucide-react";
import styles from "./AuthLoadingState.module.css";

interface AuthLoadingStateProps {
  title?: string;
  className?: string;
}