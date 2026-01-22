"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/*[--- THIRD PARTY LIBRARIES ---]*/
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

/*[--- SCHEMAS & HELPER ---]*/
import { loginSchema } from "@/schema/loginSchema";

/*[--- API HOOKS & FEATURES ---]*/
import { useLoginUserMutation, useResetPasswordRequestMutation } from "@/hooks/api/userSliceAPI";

/*[--- UI COMPONENTS ---]*/
import { useAuth } from "@/context/AuthContext";
import useTogglePassword from "@/lib/togglePassword";
import Icon from "@/lib/IconClient";

export default function FormLogin({ setIsError, setError, setIsSuccess, setForgotPasswordSuccess, setErrorMessage }) {
    const router = useRouter();
    const { isVisible: isPasswordVisible, toggle: toggleShowPassword } = useTogglePassword();
    const [loginMutation, { isLoading, isSuccess, isError, error }] = useLoginUserMutation();

    const { login } = useAuth(); // ambil dari context

    const { register, handleSubmit, formState: { errors }, reset, trigger, getValues } = useForm({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
        reValidateMode: "onBlur",
    });

    const [forgotPasswordRequest, { isLoading: isForgotPasswordLoading }] = useResetPasswordRequestMutation();

    useEffect(() => {
        setIsError(isError);
        setError(error);
        setIsSuccess(isSuccess);
    }, [isError, error, isSuccess]);

    const onSubmit = async (data) => {
        try {
            const response = await loginMutation(data).unwrap();
            if (
                response.data.isNotVerified == true
            ) {
                reset();
                router.push('/otp?token=' + response.data.token);
                return;
            } else {
                login(response.data);
                reset();
                router.push('/');
            }
        } catch (err) {
            setErrorMessage(err?.data?.error || "Login gagal. Silakan coba lagi.");
            setIsError(true);
            setIsSuccess(false);
            reset();
        }
    };

    const handleRequestPasswordReset = async () => {
        try {
            const isValid = await trigger("email"); // validasi field email
            if (!isValid) return;

            const email = getValues("email"); // ambil dari form utama
            await forgotPasswordRequest({ email }).unwrap();
            setForgotPasswordSuccess(true);
            setIsError(false);
            setErrorMessage("");
            reset();

        } catch (err) {
            setForgotPasswordSuccess(false);
            setErrorMessage(err?.data?.message || "Gagal mengirim permintaan reset password. Silakan coba lagi.");
            setIsError(true);
            reset();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-2">
            {/* Email */}
            <div className="relative w-full">
                <input
                    id="email"
                    className="peer montserratFont w-full rounded-lg bg-white px-3 pt-6 pb-2 text-sm font-normal placeholder-transparent focus:outline-blue-500"
                    type="email"
                    autoComplete='off'
                    placeholder="Email"
                    {...register("email")}
                />
                <label
                    htmlFor="email"
                    className="absolute top-2 left-3 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-blue-500"
                >
                    Email
                </label>
                {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
            </div>

            {/* Password */}
            <div className="flex flex-col w-full">
                <div className="relative flex w-full">
                    <input
                        id="password"
                        type={isPasswordVisible ? "text" : "password"}
                        className="peer montserratFont w-full rounded-lg bg-white px-3 pt-6 pb-2 text-sm font-normal placeholder-transparent focus:outline-blue-500"
                        placeholder="Password"
                        autoComplete="off"
                        {...register("password")}
                    />
                    <label
                        htmlFor="password"
                        className="absolute top-2 left-3 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-blue-500"
                    >
                        Password
                    </label>
                    <div
                        className="absolute top-1/2 right-3 h-6 w-6 -translate-y-1/2 cursor-pointer"
                        onClick={toggleShowPassword}
                    >
                        <Icon
                            icon={isPasswordVisible ? "solar:eye-broken" : "solar:eye-closed-outline"}
                            alt="Show Password"
                            className="object-cover"
                        />
                    </div>
                </div>
                {errors.password && (
                    <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
            </div>

            {/* Submit */}
            <button
                disabled={isLoading || isForgotPasswordLoading}
                className="zeinFont mt-4 cursor-pointer rounded-lg bg-[#156EB7] py-2 text-2xl font-bold text-white hover:bg-[#156EB7CC]"
            >
                {isLoading ? "Logging in ..." : "Log In"}
            </button>
        </form>
    );
}

FormLogin.propTypes = {
    setIsError: PropTypes.func.isRequired,
    setIsSuccess: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    setForgotPasswordSuccess: PropTypes.func.isRequired,
    setErrorMessage: PropTypes.func.isRequired,
};
