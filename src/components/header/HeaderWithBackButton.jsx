import React from 'react';
import PropTypes from 'prop-types';
import BackButton from './BackButton';

export default function HeaderWithBackButton({ title, children, subtitle = null, titlePosition = "center" }) {
    return (
        <section className="relative mb-2 flex items-center gap-4">
            <BackButton />
            <div className='flex flex-col gap-0 w-full items-center justify-center mt-3'
                style={{ alignItems: titlePosition === "center" ? "center" : "flex-start" }}
            >
                <h1 className="zeinFont text-3xl/5 font-bold text-[#000000]">
                    {title}
                </h1>
                {subtitle && <h2 className='text-[#000000] text-[16px] montserratFont'>
                    {subtitle}
                </h2>}
            </div>
            {children}
        </section>
    )
}

HeaderWithBackButton.propTypes = {
    title: PropTypes.string,
    children: PropTypes.node,
    subtitle: PropTypes.string,
    titlePosition: PropTypes.oneOf(['center', 'start']),
}
