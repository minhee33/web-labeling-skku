import { combineReducers } from "redux";
import toastReducer from "./toastReducer";
import labelReducer from "./labelReducer";

const rootReducer = combineReducers({
  toastReducer,
  labelReducer,
});

export type IRootState = ReturnType<typeof rootReducer>;

export default rootReducer;
