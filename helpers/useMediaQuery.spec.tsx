import { renderHook } from "@testing-library/react";
import { useMediaQuery } from "./useMediaQuery";

describe("useMediaQuery", () => {
  let matchMedia: jasmine.Spy;
  let addListener: jasmine.Spy;
  let removeListener: jasmine.Spy;

  beforeEach(() => {