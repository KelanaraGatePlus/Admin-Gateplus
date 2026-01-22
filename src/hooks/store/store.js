"use client";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { faqArticleAPI } from "../api/faqArticleAPI";
import { faqSubcategoryAPI } from "../api/faqArticleSubcategoryAPI";
import { userAPI } from "../api/userSliceAPI";


const rootReducer = combineReducers({
    [faqArticleAPI.reducerPath]: faqArticleAPI.reducer,
    [faqSubcategoryAPI.reducerPath]: faqSubcategoryAPI.reducer,
    [userAPI.reducerPath]: userAPI.reducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            faqArticleAPI.middleware,
            faqSubcategoryAPI.middleware,
            userAPI.middleware
        ),
});

setupListeners(store.dispatch);
export default store;
