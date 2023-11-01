import React, { useEffect, useState } from "react";
import "../../css/popup.scss";
import { getCookie } from "../../cookies/cookies";
import axios from "axios";
import { API_BASE_URL, ParseLabel } from "../../constant";
import { useDispatch, useSelector } from "react-redux";
import { changeLabels } from "../../module/labelReducer";
import { useToast } from "../../hooks/useToast";
import { IRootState } from "../../module/rootReducer";
import { TextField } from "./TextField";

type LabelPopUpProps = {
  input: any;
  setInput: React.Dispatch<React.SetStateAction<any>>;
  onCancel: () => void;
  onOK: (params: any) => void;
  key: string;
};

//input: ParseLabel or PointLabel
const LabelPopUp = ({
  input,
  setInput,
  onCancel,
  onOK,
  key,
}: LabelPopUpProps) => {
  const [labelInput, setLabelInput] = useState<string>("");
  const customLabelList = useSelector<IRootState, ParseLabel[]>(
    (state) => state.labelReducer.labels
  );
  const dispatch = useDispatch();

  //toast
  const successToast = useToast(
    "success",
    "성공적으로 처리되었습니다.",
    "닫기",
    () => {}
  );
  const failToast = useToast(
    "danger",
    "오류가 발생했습니다.",
    "닫기",
    () => {}
  );
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const user_id = await getCookie("user_id");
        await axios
          .get(API_BASE_URL + "/label?account_id=" + user_id)
          .then((res) => {
            const tmp_label_list: ParseLabel[] = [];
            res.data.labels.forEach((item: any) => {
              tmp_label_list.push(new ParseLabel(item.name, item.color_code));
            });
            dispatch(changeLabels(tmp_label_list));
          })
          .catch(() => {
            failToast.showToast();
          });
      } catch (e) {
        failToast.showToast();
      }
    };
    fetchLabels();
  }, []);
  return (
    <div className="popup" key={key}>
      <div className="popup-header" />

      <div className="column gap-16">
        <div
          className="row gap-8 center"
          style={{
            padding: "16px 21px",
          }}
        >
          <TextField
            placeholder="your label name"
            title=""
            input={labelInput}
            setInput={setLabelInput}
          />
          {/* <div className="body2-500 black label-popup-input">
            {input.label_name}
          </div> */}
          <div
            className="body2-500 gray-8 label-popup-cancel"
            onClick={() => {
              onCancel();
            }}
          >
            Cancel
          </div>
          <div
            className="body2-500 white label-popup-ok"
            onClick={async () => {
              // 생성
              if (labelInput === "") return;
              const user_id = await getCookie("user_id");
              await axios
                .post(API_BASE_URL + "/label", {
                  account_id: user_id,
                  name: labelInput,
                })
                .then((res) => {
                  successToast.showToast();
                  const tmp_label_list: ParseLabel[] = [];
                  res.data.labels.forEach((item: any) => {
                    tmp_label_list.push(
                      new ParseLabel(item.name, item.color_code)
                    );
                  });
                  let newLabel: ParseLabel;
                  if ("created_label" in res.data) {
                    const new_color_code = res.data.created_label.color_code;
                    const new_name = res.data.created_label.name;
                    newLabel = new ParseLabel(new_name, new_color_code);
                    setInput(newLabel);
                  } else {
                    //원래 있는 거로 넣기
                    newLabel = input;
                  }
                  dispatch(changeLabels(tmp_label_list));
                  onOK(newLabel);
                })
                .catch(() => {
                  failToast.showToast();
                });
            }}
          >
            OK
          </div>
        </div>

        {/* whole label list */}
        <div className="label-popup-content">
          {customLabelList.map((item: ParseLabel, index: number) => (
            <div
              key={index}
              onClick={() => {
                setLabelInput(item.label_name);
                setInput(item);
              }}
              onDoubleClick={() => {
                setLabelInput(item.label_name);
                setInput(item);
                onOK(item);
              }}
              className={`content-item black body2-500 
                            ${input === item ? "content-item-clicked" : ""}`}
            >
              {item.label_name} {item.label_memo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { LabelPopUp };
