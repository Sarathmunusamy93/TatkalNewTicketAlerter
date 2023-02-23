var tabID = 0,
  latestTickets = {};
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  tabID = sender.tab.id;

  if (request.type == "setValue") {
    var value = request.options;

    chrome.storage.local.set({ refreshInterval: value }).then(() => {
      sendResponse("valueSaved");
    });
  } else if (request.type == "getvalue") {
    chrome.storage.local.get(["refreshInterval"]).then((result) => {
      var response = {
        type: "internalValue",
        result: result.refreshInterval,
      };

      chrome.tabs.sendMessage(tabID, response);
    });
  } else if (request.type == "isNewTicketsAvailable") {
    latestTickets = request.options;

    chrome.storage.local.get(["refreshInterval"]).then((result) => {
      var newEntry = {},
        updatedEntry = {},
        newTickerEntry = {},
        triggerNotification = false;

      if (result.refreshInterval.lastMorningTickets != undefined) {
        if (
          result.refreshInterval.lastMorningTickets != latestTickets.morning
        ) {
          if (
            result.refreshInterval.lastMorningTickets < latestTickets.morning
          ) {
            newTickerEntry.morning = latestTickets.morning;
          } else {
            updatedEntry.morning = latestTickets.morning;
          }
        }
      } else {
        newEntry.prevMorningTicket = latestTickets.morning;
      }

      if (result.refreshInterval.lastEveningTickets != undefined) {
        if (
          result.refreshInterval.lastEveningTickets != latestTickets.evening
        ) {
          if (
            result.refreshInterval.lastEveningTickets < latestTickets.evening
          ) {
            newTickerEntry.evening = latestTickets.evening;
          } else {
            updatedEntry.evening = latestTickets.evening;
          }
        }
      } else {
        newEntry.prevEveningTicket = latestTickets.evening;
      }

      if (
        newTickerEntry.morning != undefined ||
        newTickerEntry.evening != undefined
      ) {
        // var availableSeats =
        //   (newTickerEntry.morning ? parseInt(newTickerEntry.morning) : 0) +
        //   (newTickerEntry.evening ? parseInt(newTickerEntry.evening) : 0);

        updateOldTicketsCounts(
          getFinalValueToStore(result.refreshInterval, newTickerEntry, false)
        );

        triggerNotification = true;
      }

      if (
        newEntry.prevEveningTicket != undefined ||
        newEntry.prevMorningTicket != undefined
      ) {
        if (newEntry.prevMorningTicket > 0 || newEntry.prevEveningTicket > 0) {
          triggerNotification = true;
        }

        updateOldTicketsCounts(
          getFinalValueToStore(result.refreshInterval, newEntry, true)
        );
      }

      if (
        updatedEntry.morning != undefined ||
        updatedEntry.evening != undefined
      ) {
        var availableSeats =
          (updatedEntry.morning ? parseInt(updatedEntry.morning) : 0) +
          (updatedEntry.evening ? parseInt(updatedEntry.evening) : 0);

        updateOldTicketsCounts(
          getFinalValueToStore(result.refreshInterval, updatedEntry, false)
        );

        triggerNotification = true;
      }

      if (triggerNotification) {
        trigerNotifications();
      }
    });
  }
});

function getFinalValueToStore(results, targetEntry, isnewEntry) {
  var resultItems = {
    intervalTime: results.intervalTime,
    autoRefreshEnabled: results.autoRefreshEnabled,
  };

  if (isnewEntry) {
    resultItems.lastMorningTickets = targetEntry.prevMorningTicket;
    resultItems.lastEveningTickets = targetEntry.prevEveningTicket;
  } else {
    resultItems.lastMorningTickets =
      targetEntry.morning != undefined
        ? targetEntry.morning
        : results.lastMorningTickets;
    resultItems.lastEveningTickets =
      targetEntry.evening != undefined
        ? targetEntry.evening
        : results.lastEveningTickets;
  }

  return resultItems;
}

function updateOldTicketsCounts(value) {
  chrome.storage.local.set({ refreshInterval: value }).then(() => {
    console.log("items saved..");
  });
}

function trigerNotifications() {
  var notificationOptions = {
    type: "basic",
    iconUrl: "./icon/alert-icon.png",
    title: "Tatkal Ticket Available.",
    message: "Tatkal seats available. Please take necessary action!!!",
    buttons: [{ title: "Okay" }],
  };

  // Display the notification.
  chrome.notifications.create(notificationOptions, function (id) {
    var notificationCallBackOptions = {
      notificationDone: true,
    };
    chrome.tabs.create({ url: "alertPage.html" });
  });
}
