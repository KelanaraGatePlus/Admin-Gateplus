/* eslint-disable react/react-in-jsx-scope */
"use client";
import { useRouter } from "next/navigation";
import Icon from "@/lib/IconClient";

// eslint-disable-next-line react/prop-types
export default function BackButton({ isDark = false }) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className={`mt-1.5 w-fit cursor-pointer rounded-full p-1 ${isDark ? "hover:bg-white/30" : "hover:bg-black/10"}`}
        >
            <p
                className={`flex flex-row items-center justify-start gap-2 font-semibold ${isDark ? "text-white" : "text-black"}`}
            >
                <Icon
                    icon={'solar:arrow-left-outline'}
                    alt="icons-arrow-left"
                    height={40}
                    width={40}
                />
            </p>
        </button>
    );
}
