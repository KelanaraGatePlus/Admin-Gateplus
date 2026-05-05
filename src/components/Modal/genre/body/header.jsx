import React from "react";
import { Icons } from "@/components/Icons/icons";
import PropTypes from "prop-types";

export function ModalHeader({ icon, title, subtitle, onClose }) {
    return (
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100">
                    {icon}
                </div>
                <div>
                    <h2 className="text-base font-semibold text-gray-900 leading-tight">{title}</h2>
                    {subtitle && <p className="text-xs mt-0.5 leading-relaxed text-gray-400">{subtitle}</p>}
                </div>
            </div>
            <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ml-4 mt-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            >
                <Icons.Close size={14} />
            </button>
        </div>
    );
}

ModalHeader.propTypes = {
    icon: PropTypes.node,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

ModalHeader.defaultProps = {
    icon: null,
    subtitle: null,
};