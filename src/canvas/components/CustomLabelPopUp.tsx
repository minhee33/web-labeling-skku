import React, { useEffect, useState } from "react";
import "../../css/popup.scss";
import { getCookie } from "../../cookies/cookies";
import axios from "axios";
import { API_BASE_URL, ParseLabel } from "../../constant";
import { TextField } from "./TextField";
import { useToast } from "../../hooks/useToast";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../../module/rootReducer";
import { changeLabels } from "../../module/labelReducer";

type CustomLabelPopUpProps = {
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  key: string;
};

const CustomLabelPopUp = ({ onClose, key }: CustomLabelPopUpProps) => {
  const [label, setLabel] = useState<string>("");
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
            input={label}
            setInput={setLabel}
          />
          <div
            className="body2-500 gray-8 label-popup-cancel"
            onClick={() => {
              onClose(false);
            }}
          >
            CLOSE
          </div>
          <div
            className="body2-500 white label-popup-ok"
            onClick={async () => {
              //post label
              if (label === "") return;
              const user_id = await getCookie("user_id");
              await axios
                .post(API_BASE_URL + "/label", {
                  account_id: user_id,
                  name: label,
                })
                .then((res) => {
                  successToast.showToast();
                  const tmp_label_list: ParseLabel[] = [];
                  res.data.labels.forEach((item: any) => {
                    tmp_label_list.push(
                      new ParseLabel(item.name, item.color_code)
                    );
                  });
                  dispatch(changeLabels(tmp_label_list));
                })
                .catch(() => {
                  failToast.showToast();
                });
            }}
          >
            ADD
          </div>
        </div>

        {/* whole label list */}
        <div className="label-popup-content">
          {customLabelList.map((item: ParseLabel, index: number) => (
            <div
              key={index}
              className={`content-item black body2-500`}
            >
              {item.label_name} {item.label_memo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { CustomLabelPopUp };
