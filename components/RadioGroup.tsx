
"use client"
import styles from './RadioGroup.module.css';
import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
 
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>