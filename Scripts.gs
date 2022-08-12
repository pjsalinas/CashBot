function _parser_add_row(text="the bill name false financial 77.77 -1w") {
  let str = text.trim().toLowerCase().split(" ");
  Logger.log( str );
  let values = {};
  let name = [];
  str.forEach(elem => {
    if(elem == "true" || elem == "false") {
      values['active'] = elem;
    } else if("discretionary, financial, committed".includes(elem)) {
      values['category'] = capitalize(elem);
    } else if(elem == 'today' || elem == 'tomorrow' || elem == 'yesterday' || elem == '1week' || elem == '1w' || elem == '-1w') {
      // only yyyy-mm-dd or yyyy/mm/dd
      let dt = new Date();
      let date = ( dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
      Logger.log(date);
      if(elem === 'today') {
        values['date'] = new Date(date);
      } else if(elem === 'tomorrow') {
        values['date'] = new Date(date).addDays(1);
      } else if(elem === 'yesterday') {
        values['date'] = new Date(date).addDays(-1);
      } else if(elem == '1week' || elem == '1w') {
        values['date'] = new Date(date).addDays(7);
      } else if(elem == '-1w' || elem == '-1week') {
        values['date'] = new Date(date).addDays(-7);
      }
    } else if(Date.parse(elem)) {
      values['date'] = new Date(elem).getMonth() + "/" + new Date(elem).getDate() + "/" + new Date(elem).getFullYear()
    } else if(!isNaN(elem)) {
      values['amount'] = elem;
    } else {
      name.push(elem);
    }
    Logger.log(values);
  });
  values['name'] = name.map(s => capitalize(s)).join(" ");
  let seed = _get_seed();
  let row = [values['name'], values['amount'], values['date'], values['category'], values['active'], seed];
  Logger.log(row);
  const topaySheet = SpreadsheetApp.getActive().getSheetByName('ToPay');
  topaySheet.appendRow(row);
  let message = `\`${values['name']}\` was added to your ToPay list`;
  return message;
}
/**
 * General Help message
 * 
 * @params {Void}
 * return {String}
 */
function _help() {
  message = ["Valid commands are:"];
  message.push("/topay, /balance, /help");
  message.push("To Use on `topay` entries:")
  message.push("  ^handler, update entry");
  message.push("  -handler, remove entry");
  message.push("  =handler, show entry");
  message.push("  xhandler, mark as paid entry");
  message.push("Add a new `topay` entry:")
  message.push("  name amount mm/dd/yyyy category bool")

  //message.push("Add a new `bill` entry:");
  //message.push("  name :due $amount !category %active *(freq=1,2,3,...,12)");
  message = message.join("\n");
  return message;
}

let months = [false, false, false, false, false, false, false, false, false, false, false, false];

function _parser_bills(text) {
  let values = {'name': []};
  text.split(" ").forEach(elem => {
    let action = elem.trim().slice(0,1);
    let value = elem.trim().slice(1);
    Logger.log(`-- action: ${action}`);
    Logger.log(`-- value: ${value}`);

    if(action == '$') {
      values['amount'] = value;
    } else if(action == '#') {
      values['active'] = value;
    } else if(action == '@') {
      values['category'] = value;
    } else if(action == ':') {
      values['day'] = value;
    } else if(action == '*') {
      values['freq'] = value;
    } else {
      values['name'].push(elem);
    }
  });
  values['name'] = values['name'].join(" ");
       
  let freq = values['freq'].split(',');
  Logger.log(freq);
  freq.forEach(m => {
    months[m-1] = true;
  });
  values['freq'] = months;
  Logger.log(values);

  let row = [values['name'], values['day'], values['amount'], , values['category'], values['active']];
  months.forEach(m => row.push(m));
  return row;
}

/**
 * String parser for the user request as `topay`
 * 
 * @params {Sring} text - the text to be parser
 * return {Array}
 */
function _parser_topay(text) {
  let values = {'name': []};
  text.split(" ").forEach(elem => {
    let action = elem.trim().slice(0,1);
    let value = elem.trim().slice(1);

    if(action == '$') {
      values['amount'] = value;
    } else if(action == '#') {
      values['paid'] = value;
    } else if(action == '@') {
      values['category'] = value;
    } else if(action == ':') {
      values['date'] = _format_date(value);
      if(values['date'] == undefined) {
        return _help();
      }
    } else {
      values['name'].push(elem);
    }
  });
  values['name'] = values['name'].join(" ");
  Logger.log(values);

  // get seed from spreadsheet
  let cell = SpreadsheetApp.getActive().getSheetByName('DO NOT DELETE').getRange('A2');
  let seed = cell.getValue();
  Logger.log(`seed: ${seed}`);
  let nextSeed = _random(seed);
  Logger.log(`next seed: ${nextSeed}`);
  cell.setValue(nextSeed);
  let handler = nextSeed/1000000; //.toString(16).toUpperCase();
  let row = [values['name'], values['amount'], values['date'], values['category'], values['paid'], , handler];
  return row;
}

/**
 * Return a new `seed` after a given `seed`
 * @params {Void}
 * return {Number}
 */
function _get_seed() {
  let cell = SpreadsheetApp.getActive().getSheetByName("DO NOT DELETE").getRange("A2");
  let seed = cell.getValue()*1; // TODO: do we have to convert this to a number?
  let nextSeed = _random(seed)*1; // TODO: do we have to convert this to a number?
  cell.setValue(nextSeed);
  
  //TODO: Double check this result
  return nextSeed/1000000;
}

function _parser_handler() {
  // check if the request came from the shorthand commands
  let action = text.trim().slice(0,1);
  let handler = text.trim().slice(1).toUpperCase();
  Logger.log(handler);

  switch(action) {
    case "x":
    case "X":
      message = markRecordController(handler);
    break;

    case "=":
      message = showRecordController(handler);
    break;

    case "-":
      message = 'We don\'t know how to compute this yet!!!';
    break;

    case "^":
    break;

    default:
          // check if the request is to add a new record
    break;
  }  
}

function menu(id="5397216378", text='/help') {
  Logger.log(text);
  let message = '';

  // check if the request came from the pre-define commands
  switch(text) {
    case "/topay":
      message = toPay();
      Logger.log(message);
    break;

    case "/balance":
    message = getBalance();
    break;

    case "/help":
      message = _help()
      message = encodeURI( message );
      Logger.log(encodeURI( message) );
    break;

    default:
      // check if the request came from the shorthand commands
      let action = text.trim().slice(0,1).toLowerCase();
      let handler = text.trim().slice(1).toUpperCase();
      Logger.log(action, handler);

      if(action == "^") {
        let rec = text.trim().slice(1);
        //Logger.log( rec );
        let splitRecord = rec.split(" ");
        Logger.log( splitRecord );
        let handler = splitRecord.shift();
        Logger.log( `shifted element ${handler}` );
        Logger.log( handler.length );
        if(parseInt( handler.length ) == 4) {
          // we need to check that a record with this handler exists
          Logger.log( splitRecord );
          // be sure that the element exists
          let row = {};
          let name = [];
          splitRecord.forEach(elem => {
            let action = elem.slice(0,1);
            let value = elem.slice(1);
            if(action == "$") {// amount
              row['amount'] = value;
            } else if(action == "%") { // paid: true or false
              row['paid'] = value;
            } else if(action == "!") { // category
              row['category'] = value;
            } else if(action == ":") { // date
              row['date'] = value;
            } else {
              name.push( capitalize(elem) );
            }
          });
          if(name.length > 0) {
            row['name'] = name.join(" ");
          }
          Logger.log( row );
          message = "ready to update the record ...!!!";
        } else {
          message = 'this don\'t look like a valid handler';
        }
      } else if(action == "x") {
        message = encodeURI( markRecordController(handler) );
      } else {
         message = encodeURI( _parser_add_row(text) );
      }
    break;
  }
  sendMessage(id, message);
}

function getBalance() {
  let range = SpreadsheetApp.getActive().getSheetByName('DO NOT DELETE').getRange("B2:R2");
  let values = range.getValues()[0];
  let month = "July"
  Logger.log( values );
  message = [month + " " + values[2]];
  message.push(values[15]);
  message.push(values[14]);
  message = message.join("\n");
  message = encodeURI( message );
  Logger.log( message );
  return message;
}

/**
 * Mark a record as paid
 * 
 * @params {String} handler - the 4 distintic characters that indentify a record
 * return {String} message - the answer to the user request
 */
function markRecordController(handler) {
  let message = '';
  let sheet = SpreadsheetApp.getActive().getSheetByName('ToPay');
  let row = findRowByValue(sheet, handler);
  let { location, values } = row;
  if(location == -1) {
    message = `We could not find a record with handler ${handler}`;
  } else if(values[4] == true) {
    message = `Record \`${values[0]}\` has already been paid`;
  } else {
    message = markRecordAsPaid(sheet, row);
  }
  return message;
}

/**
 * Show the requested record using its handler
 * 
 * @params {String} handler - the handler of the entry
 * @return {String}
 */
function showRecordController(handler) {
  let message = `We could not find a record with handler ${handler}`;
  let sheet = SpreadsheetApp.getActive().getSheetByName('ToPay');
  let row = findRowByValue(sheet, handler);
  let { location, values } = row;
  if(location != -1) {
    let dt = [(values[2].getMonth() + 1), values[2].getDate(), values[2].getYear()].join("/")
    message = `Entry for handler \`${handler}\`\n${values[0]}\nAmount: $${values[1].toFixed(2)}\nDate: ${dt}\nCategory: ${values[3]}`;
  }
  return encodeURI( message );
}

function updateRecordController(handler, values) {
  Logger.log(handler);
  Logger.log(values);
}

/**
 * Take the customer request as a string and split it the different parts if the apply
 * 
 * @params {String} text - the user request
 * return {object} action - what the user wants to do
 *                 handler - the 4 digit record to identify it in the store
 */
function parserText(text) {
  let action = text.trim().slice(0,1);
  let handler;

  if(action == "/"){
    return {'action': text, 'handler': ''}
  } else if("x,=,-".includes(action)) {
    return {'action': action, 'handler': handler};
  } else if(action == "^") {
    let values = '';
    let handler = text.slice(1,5);
    Logger.log( handler );
    let textLeft = text.slice(6).split(' ');
    Logger.log(textLeft);
    textLeft.forEach(t => {
      if (t.slice(0,1) == "$") { // update amount
        values['amount'] = t.slice(1);
        Logger.log(values['amount']);
      } else if(t.slice(0,1) == "::") {// update date as 'mm/dd/yyyy
        values['date'] = t.slice(1);
        Logger.log(values['date']);
      } else if(t.slice(0, 1) == "@") {// update the category
        values['category'] = t.slice(1);
        Logger.log(values['category']);
      } else {// don't know what user wants
        values = 'Unrecognized value';
      }
    })

    return {'action': action, 'handler': handler, 'values': values};
  } else {
    // Default request
  }
  
}

function showRecord(sheet, loc) {
  Logger.log(`A${loc}:F${loc}`);
  let rec = sheet.getRange(`A${loc}:F${loc}`).getValues()[0];
  let dt = new Date(rec[3])
  Logger.log(dt);
  Logger.log(`Name: ${rec[0]}\nAmount: $${rec[1]}\nCategory: ${rec[2]}\nDate: ${rec[3]}\nPaid: ${rec[4]}`);
  return encodeURI(`Name: ${rec[0]}\nAmount: $${rec[1]}\nCategory: ${rec[2]}\nDate: ${rec[3]}\nPaid: ${rec[4]}`);
}

/**
 * @params {Object} sheet - the spreadsheet attached to this GAS
 * @params {Oject} row - dictionary holding location, and value
 * return {String} - the response back to the user
 */
function markRecordAsPaid(sheet, row) {
  let { location, values } = row;
  let range = sheet.getDataRange().getCell(location, 5).setValue('true');
  return `\`${values[0]}\` was marked as paid`;
}

/**
 * Find the position of an entry by the value of the handler passed
 * 
 * @params {Object} sheet - the spreadsheet attached to this GAS
 * @params {} 
 * return {Object} - 
 */
function findRowByValue(sheet, handler) {
  let loc = -1;
  let dataRange = sheet.getDataRange();
  let row  = dataRange.getValues().filter((row, index) => {
    if(row[6] == handler) {
      loc = index +1;
      return row;
    }
  });
  return {'location': loc, 'values': row[0]};
}

function toPay() {
  const billsToPay = SpreadsheetApp.getActive().getSheetByName('ToPay')
    .getRange("A3:G").getValues()
    .filter(val => !val[4])

  let expenses = 0;
  let income = 0;
  let numBills = 0;
  let message = 'There are not bills to paid. Way to go!!!';
  if(billsToPay.length < 1) {
    return message;
  }

  message = '';
  billsToPay.forEach(bill => {
    if(bill[3] != 'Income') {
      expenses += bill[1];
      message += [bill[3].slice(0,1), bill[6], bill[2].getDate(), bill[0], '$'+bill[1].toFixed(2), '\n'].join(' ');
      numBills += 1;
    } else {
      income += bill[1];
    }
  });
  message = `You have ${numBills} bills left for a total of $${expenses}\n` + message;
  Logger.log(message);
  let encodeMessage = encodeURI(message);
  return encodeMessage;
}

/**
 * Copy `active` bills into the `ToPay` sheet as a new entry
 * retun {String} message - a notification to the customer that event has run successfully
 */
function getBillsToPay() {
  const ss = SpreadsheetApp.getActive().getSheetByName('Bills');
  const range = ss.getRange('A2:R');
  const bills = range.getValues().filter(val => val[5]);
  Logger.log(bills);

  const topaySheet = SpreadsheetApp.getActive().getSheetByName('ToPay');

  // Let evaluate each one of the rows found if any.
  for(let i=0; i< bills.length; i++){
    let row = bills[i];

    if(row[4]) { // check to see if this row is an active row.
      // Get the month from the date on the row
      let month = new Date(row[17]).getMonth() + 1;
      // To evaluate if the month is switched to "True" or "False"
      // Move the position to the corresponded month by adding 4 places
      let pos = month + 4;

      if(row[pos]) {
        // There is a new bill to pay, collect the information
        let name = row[0];
        let cost = row[2];
        let date = row[3]
        let category = row[4];

        // Prepare the new row values to append to the "Items" sheet
        let seed = _get_seed();
        let newRow = [name, cost, date, category, false, seed];
        Logger.log(newRow);
        topaySheet.appendRow(newRow);
      }
    }
  }
}

function getBillboard() {
  // Set the message with a `not found` entries
  let message = 'There are not bills set on billboard yet!!';

  // Get the "Items" spreadsheet entries.
  let rawValues = SpreadsheetApp.getActive().getSheetByName('Bills').getRange("A2:R").getValues();
  // Filter by `Active` and then sort them by `Due Date`
  let netValues = rawValues.filter(val => val[5]).sort((a,b) => a[1] - b[1]);
  Logger.log(netValues.length);
  //Logger.log(netValues);

  message = '';
  let total = 0;
  // Try the following: netValues.map(row => `add the leading zero` or not).reduce(row => amount)
  netValues.forEach(row => {
    let date = '' + row[1];
    if(date.length == 1) {
      date = `0${date}`;
    }
    message += date + " " + row[0] + " $" + row[2] + "\n";
    total += row[2];
  });

  console.log(`** To Pay:\n${message}Total: $${total}`);
  return `** To Pay:\n${message}Total: $${total}`;
}