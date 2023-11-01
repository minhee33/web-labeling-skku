import React, { useState } from "react";
import { TextField } from "./TextField";
import { Button } from "../../component";
import axios from "axios";
import { useToast } from "../../hooks/useToast";
import { API_BASE_URL } from "../../constant";
import { setCookie } from "../../cookies/cookies";

type SignupPopUp = {
  key: string;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
};

const SignupPopUp = ({ key, onClose }: SignupPopUp) => {
  //toast
  const successSignupToast = useToast(
    "success",
    "성공적으로 회원가입하였습니다.",
    "닫기",
    () => {}
  );
  const failSignupToast = useToast(
    "danger",
    "회원가입에 실패하였습니다.",
    "닫기",
    () => {}
  );

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  return (
    <div className="popup label-popup" key={key}>
      <div className="popup-header">SIGN UP</div>

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
            label="회원가입 및 로그인"
            icon="none"
            size="medium"
            onClick={async () => {
              //signup
              await axios
                .post(API_BASE_URL + "/signup", {
                  email: email,
                  password: password,
                })
                .then((res) => {
                  successSignupToast.showToast();
                  setCookie("user_id", res.data.user_id);
                  onClose(false);
                })
                .catch(() => {
                  failSignupToast.showToast();
                });
            }}
          />
        </div>
      </div>
    </div>
  );
};

SignupPopUp.defaultProps = {
  itemList: [],
  memoList: [],
};

export { SignupPopUp };
