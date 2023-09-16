import React from 'react';
import "../../css/popup.scss";
import { ParseLabel, ParseList, GarmentList, KeyPointList } from "../../constant/ParseList";

type LabelPopUpProps = {
    input: any;
    setInput: React.Dispatch<React.SetStateAction<any>>;
    onCancel: () => void;
    onOK: (params: any) => void;
    key: string;
    tabIndex: number;
}

//input: ParseLabel or PointLabel
//tabIndex: 0, 1, 2
const LabelPopUp = ({ input, setInput, onCancel, onOK, key, tabIndex }: LabelPopUpProps) => {
    var itemList: ParseLabel[];
    switch (tabIndex) {
        case 0:
            itemList = ParseList;
            break;
        case 1:
            itemList = GarmentList;
            break;
        case 2:
            itemList = KeyPointList;
            break;
        default:
            itemList = [];
    }
    return (
        <div className="popup" key={key}>
            <div className="popup-header" />

            <div className="column gap-16">
                <div className="row gap-8" style={{
                    padding: "16px 21px"
                }}>
                    <div className="body2-500 black label-popup-input">
                        {input.label_name}
                    </div>
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

                {/* whole label list */}
                <div className="label-popup-content">
                    {itemList.map((item: ParseLabel, index: number) => (
                        <div
                            key={index}
                            onClick={() => {
                                setInput(item);
                            }}
                            onDoubleClick={() => {
                                setInput(item);
                                onOK(item);
                            }}
                            className={`content-item black body2-500 
                            ${input === item ? "content-item-clicked" : ""}`}>
                            {item.label_name} {item.label_memo}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

export { LabelPopUp };