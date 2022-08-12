let scriptProperties = PropertiesService.getScriptProperties();
const TOKEN = scriptProperties.getProperty("TELEGRAM_TOKEN");
const ssId = scriptProperties.getProperty("ssId");

const telegramUrl = "https://api.telegram.org/bot" + TOKEN;
const webAppUrl = "https://script.google.com/macros/s/AKfycbyrngneBqw0IPiC82_4Micbhnd6iC_3J3ooSeB_zUFtcJ4ZgkphntUd90uG5UXSADtl/exec";

/**
 * Set the connection between Google App Scripts and Telegram
 * 
 * @params {Void}
 * return Void
 */
function setWebhook() {
  var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

/**
 * Send the response message to the user
 * 
 * @params {String} id - user identification in Telegram
 * @params {String} text - the response back to the user
 * return {Void}
 */
function sendMessage(id, text) {
  var url = telegramUrl + "/sendMessage?chat_id=" + id + "&text=" + text;
  var response = UrlFetchApp.fetch(url);
}

/**
 * Log properties if they exists
 * 
 * @params {Void}
 * return {Void}
 */
function showProperties() {
  Logger.log(PropertiesService.getScriptProperties().getProperties());
}
