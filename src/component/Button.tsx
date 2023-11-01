import React from "react";
import "../css/typography.scss";
import "../css/color.scss";
import "../css/component.scss";
import "../css/icon.css";

// btn-primary
// icon: none, left, right
// size: small, medium, large
// type: primary, secondary, tertiary, white, danger
type ButtonProps = {
    type: string;
    label: string;
    icon: string;
    size: string;
    onClick: () => void;
    iconName?: string;
}
const Button = (props: ButtonProps) => {

    const { type, label, icon, size, onClick, iconName } = props;

    let className = '';
    let iconClassName = '';

    switch (type) {
        case 'primary':
            className = 'btn-primary ';
            break;
        case 'secondary':
            className = 'btn-secondary ';
            break;
        case 'tertiary':
            className = 'btn-tertiary ';
            break;
        case 'white':
            className = 'btn-white ';
            break;
        case 'danger':
            className = 'btn-danger ';
            break;
    }

    switch (icon) {
        case 'left':
            iconClassName = iconClassName + 'icon-left ';
            break;
        case 'right':
            iconClassName = iconClassName + 'icon-right ';
            break;
    }

    switch (size) {
        case 'small':
            className = className + 'size-small';
            iconClassName = iconClassName + 'icon-small';
            break;
        case 'medium':
            className = className + 'size-medium';
            iconClassName = iconClassName + 'icon-medium';
            break;
        case 'large':
            className = className + 'size-large';
            iconClassName = iconClassName + 'icon-large';
            break;
    }


    return (
        <button onClick={onClick} className={className}>
            {icon === 'left' && <i className={`${iconName} ${iconClassName}`} />}

            {label}

            {icon === 'right' && <i className={`${iconName} ${iconClassName}`} />}
        </button>
    );
}

export { Button };