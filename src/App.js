import './App.css';
import Canvas from './canvas/containers/Canvas';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toast } from "./component/Toast";

function App() {

  const isToastShown = useSelector(state => state.toastReducer.isShown);
  const toast_type = useSelector(state => state.toastReducer.toast_type);
  const toast_text = useSelector(state => state.toastReducer.toast_text);
  const btn_label = useSelector(state => state.toastReducer.btn_label);
  const onBtnClick = useSelector(state => state.toastReducer.onBtnClick);


  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="" element={<Canvas />}></Route>
          <Route path="/labeling" element={<Canvas />}></Route>
        </Routes>
      </BrowserRouter>

      {/* <Canvas /> */}

      {
        isToastShown
        &&
        <Toast type={toast_type} toast_text={toast_text}
          btn_label={btn_label}
          onBtnClick={onBtnClick}
          isShown={isToastShown}
        />
      }
    </div>
  );
}

export default App;
