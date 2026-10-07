// Same content as index.html, but with the library stylesheet only: no Tailwind anywhere.
import van from "vanjs-core";
import "gridstack/dist/gridstack.min.css";
import "../../../lib/van-ui.css";
import { parityContent } from "./content";

van.add(document.body, parityContent());
