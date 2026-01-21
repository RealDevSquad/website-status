import { useState } from 'react';
import styles from './tooltip.module.scss';

type TooltipProps = {
    children: React.ReactNode;
    content: React.ReactNode;
    tooltipPosition?: React.CSSProperties;
    customClass?: string;
};
type CurrClass = 'fade-in' | 'fade-out';

const Tooltip = ({
    children,
    content,
    tooltipPosition,
    customClass,
}: TooltipProps) => {
    const [currClass, setCurrClass] = useState<CurrClass>('fade-out');
    const toggleClass = () => {
        setCurrClass((prev) => (prev === 'fade-out' ? 'fade-in' : 'fade-out'));
    };

    return (
        <span onMouseOver={toggleClass} onMouseOut={toggleClass}>
            {children}
            <span
                data-testid="tooltip"
                className={`${styles['tooltip']} ${styles[currClass]} ${customClass}`}
                style={{ ...tooltipPosition }}
            >
                {content}
            </span>
        </span>
    );
};

export default Tooltip;
