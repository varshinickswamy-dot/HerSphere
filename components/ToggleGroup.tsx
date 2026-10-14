"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import toggleStyles from "./Toggle.module.css"
import styles from "./ToggleGroup.module.css"

type VariantProps = {
  variant?: "default" | "outline";