import { useState } from "react";
import { Example } from "@floot/examples";
import { Calendar } from "./Calendar";
import { Button } from "./Button";
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";

const disabledDays = [
  new Date(2024, 0, 10),
  { from: new Date(2024, 0, 15), to: new Date(2024, 0, 18) },