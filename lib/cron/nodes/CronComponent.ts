export class CronComponent extends HTMLElement {
    state: any;
    hasZero: any;
    constructor() {
        super();
    }

    Init(state: any) {
        this.state = state;

        if (this.state.props != undefined) {
            this.state.props.forEach((p: any) => {
                this.state.self[p] = state.self.getAttribute(p);
            });
        }
    }

    Create(self: any, template: any) {
        self.innerHTML = "";
        var div = document.createElement("div");
        div.innerHTML = template;
        self.appendChild(div);
    }
    getElements(className: any) {
        return this.state.self.querySelectorAll(className);
    }
    getElement(className: any) {
        return this.state.self.querySelector(className);
    }
    getNumber(n: any) {
        return n.toString().padStart(2, "0");
    }
    getHasZero() {
        return this.hasZero ? 0 : 1;
    }
    addEvent(className: any, event: any, handle: any) {
        this.getElements(className).forEach((element: any) =>
            element.addEventListener(event, (e: any) => handle(e.target))
        );
    }
    increaseBrightness(hex: any, percent: any) {
        hex = hex.replace(/^\s*#|\s*$/g, "");
        if (hex.length == 3) hex = hex.replace(/(.)/g, "$1$1");

        var r = parseInt(hex.substr(0, 2), 16);
        var g = parseInt(hex.substr(2, 2), 16);
        var b = parseInt(hex.substr(4, 2), 16);

        return (
            "#" +
            (0 | ((1 << 8) + r + ((256 - r) * percent) / 100))
                .toString(16)
                .substr(1) +
            (0 | ((1 << 8) + g + ((256 - g) * percent) / 100))
                .toString(16)
                .substr(1) +
            (0 | ((1 << 8) + b + ((256 - b) * percent) / 100)).toString(16).substr(1)
        );
    }
}