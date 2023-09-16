import React from 'react';
import "../css/component.scss";
import "../css/typography.scss";
import "../css/icon.css";

type IconButtonProps = {
    iconName: string;
    onClick?: (params: any) => void;
    label: string;
    status?: boolean;
}

const IconButton = ({ iconName, onClick, label, status }: IconButtonProps) => {

    let iconClassName = 'gray-5';
    let iconDivClassName = 'icon-button-i';
    switch (status) {
        case true:
            iconClassName = 'twilight-5';
            iconDivClassName = 'icon-button-i-clicked';
            break;
    }

    return (
        <div className="icon-button" onClick={onClick}>
            <div className={iconDivClassName}>
                <i className={`${iconName} ${iconClassName}`}
                    style={{ fontSize: "24px" }}
                />
            </div>
            <text className="gray-5 body2-500"
                style={{ whiteSpace: "pre-line" }}>
                {label}
            </text>
        </div>
    );

}

export { IconButton };