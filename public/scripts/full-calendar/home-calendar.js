/*
FullCalendar integration script for the HomePage component.
*/
document.addEventListener("DOMContentLoaded", () => {
  const calendarHost = document.getElementById("home-calendar");

  if (!calendarHost || typeof FullCalendar === "undefined") {
    return;
  }

  const calendar = new FullCalendar.Calendar(calendarHost, {
    initialView: "dayGridMonth",
    height: "auto",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
  });

  calendar.render();
});
