"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import styles from "./Switch.module.css"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>