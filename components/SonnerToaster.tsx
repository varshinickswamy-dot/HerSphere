"use client";

import { Toaster as Sonner } from "sonner";
import styles from "./SonnerToaster.module.css";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * This is already included in the global context providers so should not be rendered again.