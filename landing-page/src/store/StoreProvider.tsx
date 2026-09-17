"use client";

import React, { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store } from "./index";
import { initializeAuth } from "./slices/authSlice";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      store.dispatch(initializeAuth());
      initialized.current = true;
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
