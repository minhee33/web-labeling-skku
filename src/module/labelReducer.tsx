import { ParseLabel, ParseList, KeyPointList } from "../constant";

const _CHANGE = "CHANGE_LABELS";

// Action Create Function
export const changeLabels = (newLabels: ParseLabel[]) =>
  // console.log('changeLabels: ', newLabels),
  ({
    type: _CHANGE,
    labels: newLabels,
  });

// initState
const initialState = {
  labels: ParseList,
};

// Reducer
export default function labelReducer(state = initialState, action: any) {
  switch (action.type) {
    case _CHANGE:
      //새로운 상태 반환
      return Object.assign({}, state, {
        labels: action.labels,
      });
    default:
      return state;
  }
}
