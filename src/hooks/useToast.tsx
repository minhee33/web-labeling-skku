import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { changeToast } from '../module/toastReducer';

export function useToast(toast_type: string,
    toast_text: string,
    btn_label: string,
    onBtnClick: () => void) {
    //toast_type: success / caution / danger

    const dom = useRef();
    const dispatch = useDispatch();

    function showToast() {
        dispatch(changeToast(
            true,
            toast_type,
            toast_text,
            btn_label,
            onBtnClick));
        //4초 뒤에 닫히는 건 Toast.tsx의 useEffect에 구현됨
    }


    return {
        ref: dom,
        showToast: showToast
    };
}
