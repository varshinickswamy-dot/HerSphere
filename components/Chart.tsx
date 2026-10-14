"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import styles from "./Chart.module.css"

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode