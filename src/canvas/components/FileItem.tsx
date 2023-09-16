import React from 'react';
import "../../css/component.scss";
import "../../css/color.scss";
import "../../css/icon.css";

type FileItemProps = {
    checkStatus: boolean;
    clickStatus: boolean;
    label: string;
    onClick: () => void;
    key: string;
}

function FileItem({ checkStatus, clickStatus, label, onClick, key }: FileItemProps) {
    return (
        <div className={`file-item ${clickStatus === true ? "file-item-clicked" : ""}`}
            onClick={onClick}
            key={key}
        >
            <div className={checkStatus ? "check" : "uncheck"}>
                <i className="icon-icon-check"></i>
            </div>

            <span className="body2-500 black">{label}</span>
        </div>
    );
}

export { FileItem };