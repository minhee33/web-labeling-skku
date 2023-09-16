import React from "react";

type SelectPopUp = {
    key: string;
    title: string;
    itemList: string[];
    memoList: string[];
    input: any;
    setInput: React.Dispatch<React.SetStateAction<any>>;
    onCancel: () => void;
    onOK: (params: any) => void;
}

const SelectPopUp = ({ key, title, itemList, memoList, input, setInput, onCancel, onOK }: SelectPopUp) => {
    //itemList: List[str]

    return (
        <div className="popup label-popup" key={key}>
            <div className="popup-header" >
                {title}
            </div>

            <div className="column gap-16" style={{ justifyContent: "flex-end", height: "100%" }}>

                {/* whole label list */}
                <div className="select-popup-content center">
                    {itemList.map((item: string, index: number) => (
                        <div
                            key={index}
                            onClick={() => {
                                setInput(index);
                            }}
                            onDoubleClick={() => {
                                setInput(index);
                                onOK(index);
                            }}
                            className={`select-content-item black heading3-500 
                            ${input === index ? "select-content-item-clicked" : ""}`}>
                            {item}
                            <span className="gray-5 body2-500">
                                {memoList[index]}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="row gap-8 center" style={{
                    padding: "16px 21px"
                }}>
                    <div className="body2-500 gray-8 label-popup-cancel"
                        onClick={() => {
                            onCancel();
                        }}>
                        Cancel
                    </div>
                    <div className="body2-500 white label-popup-ok"
                        onClick={() => {
                            onOK(input);
                        }}>
                        OK
                    </div>
                </div>

            </div>
        </div>
    );

}

SelectPopUp.defaultProps = {
    itemList: [],
    memoList: []
}

export { SelectPopUp };