import React from 'react';
import "../../css/component.scss";
import "../../css/color.scss";
import "../../css/icon.css";

type WorkItemProps = {
    checkStatus: boolean;
    clickStatus: boolean;
    label: string;
    onClick: () => void;
    onCheck: () => void;
    key: string;
    colorCode: string;
}

const WorkItem = ({ checkStatus, clickStatus, label, onClick, onCheck, key, colorCode }: WorkItemProps) => {
    return (
        <div className={`work-item ${clickStatus === true ? "file-item-clicked" : ""}`}
            onClick={onClick}
            key={key}
        >
            <div className="row gap-8">
                <div className={checkStatus ? "check-gray-3" : "uncheck"}
                    onClick={onCheck}
                >
                    <i className="icon-shown" style={{ fontSize: "20px" }}></i>
                </div>

                <span className="body2-500 black">{label}</span>
            </div>

            <div style={{
                width: "17px",
                height: "17px",
                borderRadius: "100px",
                backgroundColor: colorCode,
                alignSelf: "flex-end"
            }}>
            </div>
        </div>
    );
}

export { WorkItem };