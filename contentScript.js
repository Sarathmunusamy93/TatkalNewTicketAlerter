$(document).ready(function () {
  var refreshIntervalValue = 2;

  if (window.location.pathname == "/safari/tatkal/") {
    chrome.runtime.sendMessage({
      type: "getvalue",
      options: {},
    });

    chrome.runtime.onMessage.addListener(function (response, sendResponse) {
      if (response && response.type == "internalValue" && response.result) {
        if (response.result.intervalTime)
          refreshIntervalValue = Math.round(
            parseInt(response.result.intervalTime)
          );
      }

      if (response.result.autoRefreshEnabled) continueFunctionality();
    });

    function continueFunctionality() {
      var targetEle = $("#av-grid").find("tr");

      var targetSlots = [targetEle[1], targetEle[2]];
      var updateAvailable = false,
        targetdateTickets = {
          morning: 0,
          evening: 0,
        };

      for (let index = 0; index < targetSlots.length; index++) {
        const slot = targetSlots[index];
        // Checks if morning slot is available.
        if (slot) {
          var targetDate = $(slot).find("th:last");

          var targetPlace = $(targetDate).find("center");

          if (
            targetPlace &&
            targetPlace[0].innerHTML &&
            targetPlace[0].innerHTML != ""
          ) {
            var availableSeats = parseInt(targetPlace[0].innerHTML);

            if (availableSeats > 0) {
              index == 0
                ? (targetdateTickets.morning = availableSeats)
                : (targetdateTickets.evening = availableSeats);

              updateAvailable = true;
            }
          }
        }
      }

      if (!updateAvailable) {
        setTimeout(() => {
          window.location.reload();
        }, refreshIntervalValue * 1000);
      } else {
        // lets check whether items changed..
        chrome.runtime.sendMessage({
          type: "isNewTicketsAvailable",
          options: targetdateTickets,
        });
      }
    }

    function sendNotificationFn(availableSeats) {
      chrome.runtime.sendMessage({
        type: "sendNotification",
        options: {
          Message:
            "Tatkal available seats: " +
            availableSeats +
            ". Please take necessary action!!!",
        },
      });
    }
  }
});
