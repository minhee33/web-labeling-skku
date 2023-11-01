class ParseLabel {
    label_name: string;
    color: string;
    label_memo: string;
    is_shown: boolean;

    constructor(label_name: string = "", color: string = "", label_memo: string = "") {
        this.label_name = label_name;//string
        this.color = color;//string (#~~)
        this.label_memo = label_memo;//string
        this.is_shown = true;//boolean
    }

    setIsShown(is_shown: boolean) {
        this.is_shown = is_shown;
        return this;
    }
}

//label list들
//image parsing
const ParseList: ParseLabel[] = [
    new ParseLabel("Background", "#16A460"),
    new ParseLabel("Hat", "#F67171"),
    new ParseLabel("Hair", "#BDB76B"),
    new ParseLabel("Glove", "#9873FF"),
    new ParseLabel("Sunglasses", "#E06824"),
    new ParseLabel("Upper-clothes", "#4584FF"),
    new ParseLabel("Dress", "#F34E4E"),
    new ParseLabel("Coat", "#00308D"),
    new ParseLabel("Socks", "#FFE815"),
    new ParseLabel("Pants", "#8FBC8F"),
    new ParseLabel("Jumpsuits", "#87CEFA"),
    new ParseLabel("Scarf", "#6A5ACD"),
    new ParseLabel("Skirt", "#8A2BE2"),
    new ParseLabel("Face", "#DDA0DD"),
    new ParseLabel("Left-arm", "#FF1493"),
    new ParseLabel("Right-arm", "#72C6A5"),
    new ParseLabel("Left-leg", "#84A7D3"),
    new ParseLabel("Right-leg", "#C0D84D"),
    new ParseLabel("Left-shoe", "#00A6A9"),
    new ParseLabel("Right-shoe", "#6F606E"),
];

export { ParseLabel, ParseList };