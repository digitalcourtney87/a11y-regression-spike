// Exploratory reproduction of Fluent UI #4620 / fix #4662.
// The calendar must advance one month for one Space press on Next month.
import { createElement as h } from "react";
import { render } from "react-dom";
import { Calendar } from "office-ui-fabric-react/lib/Calendar";

const strings = {
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["S", "M", "T", "W", "T", "F", "S"],
  goToToday: "Go to today",
  prevMonthAriaLabel: "Previous month",
  nextMonthAriaLabel: "Next month",
  prevYearAriaLabel: "Previous year",
  nextYearAriaLabel: "Next year",
};

render(
  h("main", null,
    h("h1", null, "Calendar keyboard regression check"),
    h(Calendar, { value: new Date(2018, 3, 15), today: new Date(2018, 3, 15), showMonthPickerAsOverlay: false, strings }),
  ),
  document.getElementById("root"),
);
