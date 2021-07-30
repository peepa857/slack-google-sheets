function doPost(request) {
  var params = request.parameter;
  console.log(params);
  var text = params.text; // the options provided after the command as a single string
  var command = params.command;
  // visit https://api.slack.com/slash-commands/#app_command_handling for available payload sent by slack

  if (command == '/submit') {
    let message = text.split("\n");
    let date = Utilities.formatDate(new Date(), 'JST', 'yyyy/MM/dd');
    let reporter = params.user_name ?? "no_username";
    let summary = message[0] ?? "";
    let detail = message[1] ?? "";
    let status = message[2] ?? "";
    let solution = message[3] ?? "";
    let references = message[4] ?? "";
    let remarks = message[5] ?? "";
    let rowData = [
      date,
      reporter,
      summary,
      detail,
      status,
      solution,
      references,
      remarks,
    ];
    // call function to add row as declared below
    addRow(rowData);
    // call function to send created issue to slack
    sync();
    // finally we return the response back to slack
    let response = {
      "response_type": "ephemeral",
      "text": `「${summary}」has been added to issues list. Thank you for your submission! :tada:`,
    };
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  } else if (command == '/issues') {
    let rows = SpreadsheetApp.getActiveSheet().getDataRange().getValues();
    rows.map((r) => r[0] instanceof Date ? r[0] = Utilities.formatDate(r[0], "JST", "yyyy/MM/dd") : r[0] = r[0]);
    let response = {
      "response_type": "ephemeral",
      "text": rows.join('\n'),
    };
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  } else {
    let response = {
      "response_type": "ephemeral",
      "text": "sorry, I don't know it.",
    };
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  }
}

function addRow(rowData) {
  // more info https://developers.google.com/apps-script/guides/sheets
  var sheet = SpreadsheetApp.getActiveSheet();
  // adds a new row to the sheet
  sheet.appendRow(rowData);
}

function sync() {
  var rows = SpreadsheetApp.getActiveSheet().getDataRange().getValues();
  console.log(rows);
  var latestRow = rows[rows.length - 1];
  // send message text
  var text = `${latestRow[1]}さんの投稿\n> 概要：${latestRow[2]}\n> 詳細：${latestRow[3]}\n> 状態：${latestRow[4]}\n> 解決策：${latestRow[5]}\n> 参照：${latestRow[6]}\n> 備考：${latestRow[7]}`;
  postSlack(text);
}

function postSlack(text) {
  // Webhook URL
  var url = 'Webhook URL';
  var params = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text: text }),
  };
  UrlFetchApp.fetch(url, params);
}
