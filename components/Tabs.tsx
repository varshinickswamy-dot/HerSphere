"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import styles from "./Tabs.module.css";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<