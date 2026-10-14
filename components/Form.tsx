/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { Dispatch, SetStateAction, useRef, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import { z, ZodError, ZodIssue, ZodIssueCode } from "zod";
import styles from "./Form.module.css";

/**
 * Core function for setting up form with types.