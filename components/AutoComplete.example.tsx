import { useState } from "react";
import { Mail, Package, User } from "lucide-react";
import { Example } from "@floot/examples";
import { AutoComplete, type Option } from "./AutoComplete";

const colors: Option[] = [
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },