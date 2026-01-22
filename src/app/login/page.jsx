"use client";
import React, { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import logo from "@@/images/logoGate+/logo-header-login.svg";
import FormLogin from "@/components/form/auth/FormLogin";

export default function LoginPage() {
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // === AUTO DISMISS ALERT AFTER 1 MINUTE ===
    useEffect(() => {
        let timer;

        if (isError || isSuccess || forgotPasswordSuccess) {
            timer = setTimeout(() => {
                setIsError(false);
                setIsSuccess(false);
                setForgotPasswordSuccess(false);
                setErrorMessage("");
                setError(null);
            }, 60000); // 60 detik
        }

        // Cleanup agar timer dibersihkan jika komponen unmount atau alert berubah
        return () => clearTimeout(timer);
    }, [isError, isSuccess, forgotPasswordSuccess]);

    return (
        <div className="flex min-h-screen w-full items-center justify-center px-4">
            <main className="flex h-full w-full max-w-lg flex-col rounded-lg border-[#1382C9] bg-[#135B8E] px-4 py-6 [box-shadow:0px_4px_70px_rgba(19,130,201,0.5)]">
                <section className="flex flex-col">
                    <div className="relative ml-2 flex h-24 w-fit items-center justify-start">
                        <div className="scale-125">
                            <Image
                                src={logo}
                                alt="logo-gateplus"
                                priority
                                width={128}
                                height={64}
                                className="object-contain"
                                aria-label="logo-gateplus-loginPage"
                            />
                        </div>
                    </div>

                    <div className="-mt-6 mb-2.5 flex translate-y-2">
                        <p className="montserratFont my-2 text-sm font-normal text-[#1DBDF5]">
                            <span>Welcome back, you&apos;ve been missed</span>
                        </p>
                    </div>
                </section>

                <section>
                    {/* === ERROR ALERT === */}
                    {isError && (
                        <div className="mb-2 flex items-center space-x-2 rounded-lg border border-red-600 bg-red-800 px-4 py-3 text-xs font-medium text-red-200">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="flex h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                                />
                            </svg>
                            <p>
                                {errorMessage || error?.data?.error || "An error occurred. Please try again."}
                            </p>
                        </div>
                    )}

                    {/* === LOGIN SUCCESS ALERT === */}
                    {isSuccess && (
                        <div className="mb-2 flex items-center space-x-2 rounded-lg border border-green-600 bg-green-800 px-4 py-3 text-xs font-medium text-green-200">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="flex h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            <p>Login Berhasil!</p>
                        </div>
                    )}

                    {/* === FORGOT PASSWORD SUCCESS ALERT === */}
                    {forgotPasswordSuccess && (
                        <div className="mb-2 flex items-center space-x-2 rounded-lg border border-green-600 bg-green-800 px-4 py-3 text-xs font-medium text-green-200">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="flex h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            <p>Permintaan perubahan password telah dikirim ke email Anda.</p>
                        </div>
                    )}

                    {/* === FORM LOGIN === */}
                    <Suspense fallback={<div>Loading...</div>}>
                        <FormLogin
                            setIsError={setIsError}
                            setError={setError}
                            setIsSuccess={setIsSuccess}
                            setForgotPasswordSuccess={setForgotPasswordSuccess}
                            setErrorMessage={setErrorMessage}
                        />
                    </Suspense>
                </section>
            </main>
        </div>
    );
}
