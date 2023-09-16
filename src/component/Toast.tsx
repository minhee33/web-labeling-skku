import React, { useEffect, useState } from "react";
import { useMediaQuery } from 'react-responsive';
import "../css/toast.scss";
import "../css/typography.scss";
import "../css/color.scss";
import { useDispatch } from "react-redux";
import { changeToast } from "../module/toastReducer";

type ToastProps = {
    type: string;
    toast_text: string;
    btn_label: string;
    onBtnClick: () => void;
    isShown: boolean;
}
const Toast = (props: ToastProps) => {

    //type: success, caution, danger, no_icon
    const { type, toast_text, btn_label, onBtnClick, isShown } = props;

    const isDesktop = useMediaQuery({
        query: "(min-width:768px)"
    });

    var iconSrc = "";
    switch (type) {
        case "success":
            iconSrc = "img/icon/icon-check-filled-circled.svg";
            break;
        case "caution":
            iconSrc = "img/icon/icon-caution-filled-circled.svg";
            break;
        case "danger":
            iconSrc = "img/icon/icon-x-filled-circled.svg";
            break;
    }

    const [isToastAnimation, setIsToastAnimation] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        //맨 처음 render시 실행됨
        if (isShown === true) {
            setIsToastAnimation(true);
        }
        //4초 뒤에 닫는 걸 여기다가 넣자
        setTimeout(() => {
            setIsToastAnimation(false);
            setTimeout(function () {
                dispatch(changeToast(false));
            }, 300);//0.3s
        }, 4000);
    }, []);

    if (isDesktop)
        return (
            <div className={`toast ${isToastAnimation === true ? "show-toast " : " "}`} {...props}>
                {/* icon */}
                {
                    iconSrc !== ""
                    &&
                    <img src={iconSrc} width="24px" height="24px"></img>
                }

                <text className="body1-700 gray-1" style={{
                    padding: "2px 0", textAlign: 'start',
                    width: "100vw", margin: "0", whiteSpace: "pre-line"
                }}>
                    {toast_text}
                </text>

                {/* button */}
                {
                    btn_label
                    &&
                    <div onClick={() => {
                        if (btn_label === '닫기') {
                            //닫기일 때는 닫기
                            setIsToastAnimation(false);
                            setTimeout(function () {
                                dispatch(changeToast(false));
                            }, 300);//0.3s
                        } else {
                            onBtnClick();
                        }

                    }} className="body1-500 gray-5 click"
                        style={{ whiteSpace: "nowrap" }}
                    >
                        {btn_label}
                    </div>
                }
            </div>
        );

    //mobile
    return (
        <div className={`toast ${isToastAnimation === true ? "show-toast " : " "}`} {...props}>
            {/* icon */}
            {
                iconSrc !== ""
                &&
                <img src={iconSrc} width="18px" height="18px"></img>
            }

            <text className="body2-700 gray-1" style={{
                padding: "1px 0", textAlign: 'start',
                width: "100vw", margin: "0", whiteSpace: "pre-line"
            }}>
                {toast_text}
            </text>

            {/* button */}
            {
                btn_label
                &&
                <div onClick={() => {
                    if (btn_label === '닫기') {
                        //닫기일 때는 닫기
                        setIsToastAnimation(false);
                        setTimeout(function () {
                            dispatch(changeToast(false));
                        }, 300);//0.3s
                    } else {
                        onBtnClick();
                    }

                }} className="body2-500 gray-5 click"
                    style={{ whiteSpace: "nowrap" }}
                >
                    {btn_label}
                </div>
            }
        </div>
    );
}

export { Toast };