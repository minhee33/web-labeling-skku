import React, { useRef } from "react";

type TextFieldProps = {
    placeholder: string;
    title: string;
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    className?: string;
}

const TextField = (props: TextFieldProps) => {
    const { placeholder, title, input, setInput, className } = props;

    const inputRef = useRef<HTMLInputElement>();

    return (
        <div style={{
            display: "flex",
            flexDirection: "column", textAlign: "start", gap: "4px", width: "100%"
        }}
            {...props}
        >
            {title !== "" && <span className="body1-700">{title}</span>}
            <input className={`text-field ${className}`}
                placeholder={placeholder} ref={inputRef}
                defaultValue={input}
                onChange={() => {
                    setInput(inputRef.current.value);
                }}
            ></input>
        </div>
    );
}

export { TextField };