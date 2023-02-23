$(document).ready(function () {
  $("#info").hide();

  chrome.runtime.sendMessage({
    type: "getvalue",
    options: {},
  });
  $("#btn").click(function () {
    var value = $("#intervalTime").val(),
      isAutoRefreshEnabled = $("#isAutoRefesherEnabled").prop("checked");

    chrome.runtime.sendMessage(
      {
        type: "setValue",
        options: {
          intervalTime: value,
          autoRefreshEnabled: isAutoRefreshEnabled,
        },
      },
      (response) => {
        setTimeout(() => {
          $("#info").show();
          setTimeout(fade_out, 5000);

          function fade_out() {
            $("#info").hide();
          }
        }, 100);
      }
    );
  });

  chrome.runtime.onMessage.addListener(function (response, sendResponse) {
    if (response && response.type == "internalValue" && response.result) {
      $("#intervalTime").val(response.result.intervalTime);
      $("#isAutoRefesherEnabled").prop(
        "checked",
        response.result.autoRefreshEnabled
      );
    }
  });
});
