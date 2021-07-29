function doPost(request) {
  var params = request.parameter;
  var text = params.text; // the options provided after the command as a single string
  // visit https://api.slack.com/slash-commands/#app_command_handling for available payload sent by slack

  var message = text.split(" ");

  var date = new Date();
  var reporter = params.user_name ?? "no_username";
  var summary = message[0] ?? "";
  var detail = message[1] ?? "";
  var status = message[2] ?? "";
  var solution = message[3] ?? "";
  var references = message[4] ?? "";
  var remark = message[5] ?? "";

  var rowData = [
    date,
    reporter,
    summary,
    detail,
    status,
    solution,
    references,
    remark,
  ];

  // call function to add row as declared below
  addRow(rowData);

  var response = {
    "response_type": "ephemeral",
    "text": "「" + summary + "」" + " has been added to issues list. Thank you for your submission! :tada:",
  };
  // finally we return the response back to slack
  sync();
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function addRow(rowData) {
  // more info https://developers.google.com/apps-script/guides/sheets
  var sheet = SpreadsheetApp.getActiveSheet();
  // adds a new row to the sheet
  sheet.appendRow(rowData);
}

function sync() {
  var rows = SpreadsheetApp.getActiveSheet().getDataRange().getValues();
  var latestRow = rows[rows.length - 1];
  // send message text
  var text = `${latestRow[1]}さんの投稿\n> 概要：${latestRow[2]}\n> 詳細：${latestRow[3]}\n> 状態：${latestRow[4]}\n> 解決策：${latestRow[5]}\n> 参照：${latestRow[6]}\n> 備考：${latestRow[7]}`;
  postSlack(text);
}

function postSlack(text) {
  // Webhook URL
  var url = 'slack_Webhook';
  var params = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text: text }),
  };
  UrlFetchApp.fetch(url, params);
}
