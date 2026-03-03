"use client";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { faqArticleAPI } from "../api/faqArticleAPI";
import { faqSubcategoryAPI } from "../api/faqArticleSubcategoryAPI";
import { userAPI } from "../api/userSliceAPI";
import { reportManagementAPI } from "../api/reportManagementAPI";
import { reportCommentManagementAPI } from "../api/reportCommentManagementAPI";
import { contentManagementAPI } from "@/hooks/api/contentManagementSliceAPI";
import { financialAPI } from "@/hooks/api/financialSliceAPI";

const rootReducer = combineReducers({
  [faqArticleAPI.reducerPath]: faqArticleAPI.reducer,
  [faqSubcategoryAPI.reducerPath]: faqSubcategoryAPI.reducer,
  [userAPI.reducerPath]: userAPI.reducer,
  [reportManagementAPI.reducerPath]: reportManagementAPI.reducer,
  [reportCommentManagementAPI.reducerPath]: reportCommentManagementAPI.reducer,
  [contentManagementAPI.reducerPath]: contentManagementAPI.reducer,
  [financialAPI.reducerPath]: financialAPI.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      faqArticleAPI.middleware,
      faqSubcategoryAPI.middleware,
      userAPI.middleware,
      reportManagementAPI.middleware,
      reportCommentManagementAPI.middleware,
      contentManagementAPI.middleware,
      financialAPI.middleware,
    ),
});

setupListeners(store.dispatch);
export default store;