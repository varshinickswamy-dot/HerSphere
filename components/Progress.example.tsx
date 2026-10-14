import { useEffect, useState } from "react";
import { Example } from "@floot/examples";
import { Progress } from "./Progress";

function AnimatedProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {