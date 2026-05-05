import React from "react";
import PropTypes from "prop-types";

const SvgWrapper = ({
  children,
  className = "h-5 w-5",
  strokeWidth = 2,
  viewBox = "0 0 24 24",
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox={viewBox}
    xmlns="http://www.w3.org/2000/svg"
    strokeWidth={strokeWidth}
    {...props}
  >
    {children}
  </svg>
);

SvgWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  strokeWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  viewBox: PropTypes.string,
};

export const Icons = {
  Plus: (props) => (
    <SvgWrapper {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </SvgWrapper>
  ),
  Search: (props) => (
    <SvgWrapper {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </SvgWrapper>
  ),
  Filter: (props) => (
    <SvgWrapper {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </SvgWrapper>
  ),
  Edit: (props) => (
    <SvgWrapper className="h-4 w-4" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </SvgWrapper>
  ),
  Trash: (props) => (
    <SvgWrapper className="h-4 w-4" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </SvgWrapper>
  ),
  Eye: (props) => (
    <SvgWrapper className="h-4 w-4" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </SvgWrapper>
  ),
  X: (props) => (
    <SvgWrapper className="h-6 w-6" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </SvgWrapper>
  ),
  Upload: (props) => (
    <SvgWrapper className="h-12 w-12 text-gray-400" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </SvgWrapper>
  ),
  ChevronDown: (props) => (
    <SvgWrapper className="h-4 w-4" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </SvgWrapper>
  ),
  Calendar: (props) => (
    <SvgWrapper className="ml-1 inline-block h-4 w-4" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </SvgWrapper>
  ),
  Image: (props) => (
    <SvgWrapper className="h-16 w-16 text-gray-300" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </SvgWrapper>
  ),
  Pencil: (props) => (
    <SvgWrapper {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </SvgWrapper>
  ),
  CheckCircle: (props) => (
    <SvgWrapper className="h-16 w-16 text-green-500" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </SvgWrapper>
  ),
  ExclamationCircle: (props) => (
    <SvgWrapper className="h-16 w-16 text-red-500" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </SvgWrapper>
  ),
  AlertCircle: (props) => (
    <SvgWrapper className="h-16 w-16 text-yellow-500" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </SvgWrapper>
  ),
  Spinner: (props) => {
    const { className = "", strokeWidth = 4, ...rest } = props;
    return (
      <svg
        className={`h-5 w-5 animate-spin ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        {...rest}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  },
  FileText: (props) => {
    const { size = 18, color = "#6b7280" } = props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )
  },
  DollarSign: (props) => {
    const { size = 18, color = "#6b7280" } = props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )
  },
  Activity: (props) => {
    const { size = 14, color = "#ef4444" } = props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    );
  },
  Tag: (props) => {
    const { size = 18, color = "currentColor" } = props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    );
  },
  Warning: (props) => {
    const { size = 22, color = "#f59e0b" } = props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  },
  Close: (props) => {
    const { size = 18, color = "currentColor" } = props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }
};

const iconProps = {
  className: PropTypes.string,
  strokeWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  viewBox: PropTypes.string,
};

Icons.Plus.propTypes = iconProps;
Icons.Search.propTypes = iconProps;
Icons.Filter.propTypes = iconProps;
Icons.Edit.propTypes = iconProps;
Icons.Trash.propTypes = iconProps;
Icons.Eye.propTypes = iconProps;
Icons.X.propTypes = iconProps;
Icons.Upload.propTypes = iconProps;
Icons.ChevronDown.propTypes = iconProps;
Icons.Calendar.propTypes = iconProps;
Icons.Image.propTypes = iconProps;
Icons.Pencil.propTypes = iconProps;
Icons.CheckCircle.propTypes = iconProps;
Icons.ExclamationCircle.propTypes = iconProps;
Icons.AlertCircle.propTypes = iconProps;
Icons.Spinner.propTypes = iconProps;
