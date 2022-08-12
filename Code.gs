



function _fakeMessage(message) {
  sendMessage("5397216378", message);
}

function doPost(e) {
  var contents = JSON.parse(e.postData.contents);
  var id = contents.message.from.id;
  Logger.log(`message id ${id}`);
  var text = contents.message.text;
 // var expr = text.trim();

  if(text == undefined || text == null) {
    let message = _help();
  }

  //sendMessage(id, menu(id, text));
  menu(id, text);
}