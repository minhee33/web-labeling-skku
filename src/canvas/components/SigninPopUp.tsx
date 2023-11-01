import React, { useState } from "react";
import { TextField } from "./TextField";
import { Button } from "../../component";
import axios from "axios";
import { useToast } from "../../hooks/useToast";
import { API_BASE_URL } from "../../constant";
import { setCookie } from "../../cookies/cookies";

type SigninPopUp = {
  key: string;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
};

const SigninPopUp = ({ key, onClose }: SigninPopUp) =>
  {
    //toast
    const successLoginToast = useToast(
      "success",
      "성공적으로 로그인하였습니다.",
      "닫기",
      () => {}
    );
    const failLoginToast = useToast(
      "danger",
      "로그인에 실패하였습니다.",
      "닫기",
      () => {}
    );

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    return (
      <div className="popup label-popup" key={key}>
        <div className="popup-header">LOGIN</div>

        <div
          className="column gap-16 center"
          style={{ height: "100%", padding: "10px" }}
        >
          <TextField
            placeholder="example@gmail.com"
            title="이메일 *"
            input={email}
            setInput={setEmail}
          />
          <TextField
            placeholder="1234"
            title="비밀번호 *"
            input={password}
            setInput={setPassword}
          />
          <div className="row">
            <Button
              type="primary"
              label="로그인"
              icon="none"
              size="medium"
              onClick={async () => {
                //login
                await axios
                  .post(API_BASE_URL + "/signin", {
                    email: email,
                    password: password,
                  })
                  .then((res) => {
                    successLoginToast.showToast();
                    setCookie("user_id", res.data.user_id);
                    onClose(false);
                  })
                  .catch(() => {
                    failLoginToast.showToast();
                  });
              }}
            />
          </div>
        </div>
      </div>
    );
  };

SigninPopUp.defaultProps = {
  itemList: [],
  memoList: [],
};

export { SigninPopUp };
