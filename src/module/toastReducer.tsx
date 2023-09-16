const _CHANGE = 'CHANGE_TOAST';

// Action Create Function
export const changeToast = (
    isShown?: boolean | null,
    toast_type?: string | null,
    toast_text?: string | null,
    btn_label?: string | null,
    onBtnClick?: (params: any) => void) => (
    // console.log('changeToast: ', isShown),
    {
        type: _CHANGE,

        isShown: isShown,

        toast_type: toast_type,
        toast_text: toast_text,
        btn_label: btn_label,
        onBtnClick: onBtnClick
    }
)

// initState
const initialState = {
    isShown: false,

    //toast 정보들
    toast_type: "",
    toast_text: "",
    btn_label: "",
    onBtnClick: () => { }
}

// Reducer
export default function toastReducer(state = initialState, action: any) {
    switch (action.type) {
        case _CHANGE:
            return Object.assign({}, state, {
                isShown: action.isShown,
                toast_type: action.toast_type,
                toast_text: action.toast_text,
                btn_label: action.btn_label,
                onBtnClick: action.onBtnClick
            })
        default:
            return state;
    }
}