import React from "react";
import { useEffect } from "react";
import PropTypes from "prop-types";

export function ModalBase({ onClose, children, maxWidth = "max-w-md" }) {
    useEffect(() => {
        const esc = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", esc);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", esc);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className={`w-full ${maxWidth} overflow-hidden rounded-2xl animate-[modalIn_0.28s_cubic-bezier(0.34,1.56,0.64,1)_forwards]`}
                style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.08)",
                }}
            >
                {children}
            </div>
        </div>
    );
}

ModalBase.propTypes = {
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    maxWidth: PropTypes.string,
}