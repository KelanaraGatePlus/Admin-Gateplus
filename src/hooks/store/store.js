"use client";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { faqArticleAPI } from "../api/faqArticleAPI";
import { faqSubcategoryAPI } from "../api/faqArticleSubcategoryAPI";
import { userAPI } from "../api/userSliceAPI";
import { reportManagementAPI } from "../api/reportManagementAPI";
import { reportCommentManagementAPI } from "../api/reportCommentManagementAPI";

const rootReducer = combineReducers({
    [faqArticleAPI.reducerPath]: faqArticleAPI.reducer,
    [faqSubcategoryAPI.reducerPath]: faqSubcategoryAPI.reducer,
    [userAPI.reducerPath]: userAPI.reducer,
    [reportManagementAPI.reducerPath]: reportManagementAPI.reducer,
    [reportCommentManagementAPI.reducerPath]: reportCommentManagementAPI.reducer,
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
        ),
});

setupListeners(store.dispatch);
export default store;