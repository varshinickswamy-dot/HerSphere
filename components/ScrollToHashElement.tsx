import { useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToHashElement = () => {
  let location = useLocation();

  let hashElement = useMemo(() => {
    let hash = location.hash;
    const removeHashCharacter = (str: string) => {