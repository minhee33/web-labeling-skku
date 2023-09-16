import React, { forwardRef, LegacyRef } from "react";
import '../css/component.scss'
import '../css/dropdown.scss';

type DropDownProps = {
    title?: string;
    isScrollable?: boolean;
    labelList: string[];
    isClicked: boolean
    setIsClicked: React.Dispatch<React.SetStateAction<boolean>>;
    select: string;
    setSelect: React.Dispatch<React.SetStateAction<string>>;
}

const DropDown = forwardRef((props: DropDownProps, ref: LegacyRef<HTMLDivElement>) => {
    const { title, isScrollable, labelList, isClicked, setIsClicked,
        select, setSelect } = props;

    return (
        <div
            style={{
                display: "flex", flexDirection: "column",
                textAlign: "start", gap: "4px",
                width: "100%"
            }}
            ref={ref}
        // {...props}
        >
            {title !== "" && <span className="body1-700">{title}</span>}

            <div className="dropdown">
                <button onClick={
                    () => {
                        setIsClicked(!isClicked);
                    }}
                    className={
                        `${select === "" ? "gray-7" : "gray-3"}
                        ${isClicked === true ? " clicked-dropdown-btn" : " "}`
                    }
                    style={{ width: "100%", backgroundColor: "white" }}
                >
                    {select === "" ? "선택하기" : select}
                    <i className={isClicked === true ? "icon-icon-disclosure-up" : "icon-icon-disclosure"} style={{ fontSize: "24px" }} />
                </button>

                <div
                    className={`dropdown-options 
                    ${isScrollable === true ? "dropdown-scrollable " : " "}
                    ${isClicked === true ? "clicked-dropdown-options " : " "}
                    `}
                >

                    {labelList.map((item, index) => <DropDownItem label={item}
                        selectedLabel={select}
                        setSelectedLabel={setSelect}
                        setIsClicked={setIsClicked}
                        key={`${title}dropdown${index}`}
                    ></DropDownItem>)}
                </div>

            </div>
        </div>
    );
})

DropDown.displayName = "DropDown";
DropDown.defaultProps = {
    labelList: []
}

type DropDownItemProps = {
    label: string;
    selectedLabel: string;
    setSelectedLabel: React.Dispatch<React.SetStateAction<string>>;
    setIsClicked: React.Dispatch<React.SetStateAction<boolean>>;
    key: string;
}

const DropDownItem = (props: DropDownItemProps) => {

    const { label, selectedLabel, setSelectedLabel, setIsClicked, key } = props;

    return (
        <button className={`dropdown-item-btn 
        ${label === selectedLabel ? " selected-dropdown-item-btn" : " "}`}
            onClick={() => {
                setSelectedLabel(label);
                setIsClicked(false);
            }}
            style={{ width: "100%" }}
            key={key}
        >{label}</button>
    );
}

export { DropDown };