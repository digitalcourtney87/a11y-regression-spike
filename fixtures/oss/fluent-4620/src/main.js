// Exploratory reproduction of Fluent UI #4620 / fix #4662.
// The calendar must advance one month for one Space press on Next month.
import { createElement as h } from "react";
import { render } from "react-dom";
import { Calendar } from "office-ui-fabric-react/lib/Calendar";

render(
  h("main", null,
    h("h1", null, "Calendar keyboard regression check"),
    h(Calendar, { value: new Date(2018, 3, 15), today: new Date(2018, 3, 15), showMonthPickerAsOverlay: false }),
  ),
  document.getElementById("root"),
);
