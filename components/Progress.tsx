"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import styles from "./Progress.module.css"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>