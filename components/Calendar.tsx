"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import styles from "./Calendar.module.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  mode: "single" | "range";
};