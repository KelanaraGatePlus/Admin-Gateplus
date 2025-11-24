"use client";

import React from "react";
import PropTypes from "prop-types";
import { createContext, useContext, useState, useEffect } from "react";
import { clearUserData, getUserData, storeUserData } from "@/helper/authHelper";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Cek apakah ada user di localStorage saat app pertama kali jalan
        const savedUser = getUserData();
        if (savedUser) setUser(savedUser);
    }, []);

    const login = (data) => {
        storeUserData(data);
        setUser(getUserData()); // update langsung biar Navbar rerender
    };

    const logout = () => {
        clearUserData();
        setUser(null);
    };

    const refreshUser = () => {
        const updatedUser = getUserData();
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
