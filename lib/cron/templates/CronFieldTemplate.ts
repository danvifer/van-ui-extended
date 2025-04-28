import van from "vanjs-core";
const { div, form, input, label, option, select, span } = van.tags

export function CronFieldTemplateGenerator(obj: any, objLang: any) {
    return div(
        form(
            div({ style: "display: flex; height: 138px;" },
                div({ class: "panel panel-default", style: "margin-right: 2.5px; width: 50%; height: 132px;" },
                    div({ class: "panel-heading" },
                        div({ style: "display: flex;" },
                            input({ class: "propagationClass form-check-input", type: "radio", name: "choise", value: "1", match: "choise", checked: "" }),
                            span({ style: "margin-left: 10px;" },
                                objLang.stepChoise,
                            ),
                        ),
                    ),
                    div({ class: "panel-body", style: "display: flex !important;" },
                        div({ class: "propagationClass form-group", style: "margin-right: 5px; width: 50%;" },
                            label({ for: "everySelect" },
                                objLang.every,
                            ),
                            select({ match: "every", class: "form-control", style: "width: 100%;" },
                                option(
                                    "*",
                                ),
                            ),
                        ),
                        div({ class: "form-group", style: "margin-left: 5px; width: 50%;" },
                            label({ for: "stepSelect" },
                                objLang.step
                            ),
                            select({ match: "step", class: "propagationClass form-control", style: "width: 100%;" },
                                option(
                                    "*",
                                ),
                            ),
                        ),
                    ),
                ),
                div({ class: "panel panel-default", style: "margin-left: 2.5px; width: 50%; height: 132px;" },
                    div({ class: "panel-heading" },
                        div({ style: "display: flex;" },
                            input({ class: "propagationClass form-check-input", type: "radio", name: "choise", value: "2", match: "choise" }),
                            span({ style: "margin-left: 10px;" },
                                objLang.rangeChoise
                            ),
                        ),
                    ),
                    div({ class: "panel-body" },
                        div({ class: "form-group" },
                            div({ style: "display: flex;" },
                                div({ style: "width: 50%; margin-right: 5px;" },
                                    label({ class: "form-check-label", for: "exampleRadios1" },
                                        objLang.min
                                    ),
                                    select({ match: "rangeMin", class: "propagationClass form-control", style: "width: 100%;" }
                                    ),
                                ),
                                div({ style: "width: 50%; margin-right: 5px;" },
                                    label({ class: "form-check-label", for: "exampleRadios1" },
                                        objLang.max,
                                    ),
                                    select({ match: "rangeMax", class: "propagationClass form-control", style: "width: 100%;" }
                                    ),
                                ),
                            ),
                        ),
                    ),
                ),
            ),
            div({ class: "panel panel-default", style: "margin: 0px !important; padding: 0px !important; height: 250px;" },
                div({ class: "panel-heading" },
                    div({ style: "display: flex;" },
                        input({ class: "propagationClass form-check-input", type: "radio", name: "choise", value: "3", match: "choise" }),
                        span({ style: "margin-left: 10px;" },
                            objLang.choise
                        ),
                    ),
                ),
                div({ class: "panel-body", style: "padding-top: 6px !important;" },
                    div({ match: "spesific", class: "form-group", style: "display: flex !important; flex-wrap: wrap !important; margin: 0px !important; padding: 0px !important;" }
                    ),
                ),
            ),
        ),
    )
        ;
}