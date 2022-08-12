/**
 * Add days to a date
 * 
 * @params {Number} days - the number of days to add
 * return {String}
 */
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

function _date_parser(d="19-11-2022") {
    if (!isNaN(Date.parse(d))) {
      console.log(new Date(d));
    } else {
      Logger.log('not a valid date')
    }
}

function _split_string(s="the element $amount :2022-7-19 %true !category *1,2,3") {
  Logger.log(s);
  let ss = s.split(/:|%|!|"*"|"!"/);
  Logger.log(ss);
}

/**
 * Generate a random number
 * https://en.wikipedia.org/wiki/Middle-square_method
 * 
 * @params {Number} seed - the seed, initial value
 * return {Number}
 */
function _random(seed) {
  let seedx2 = seed * seed;
  let ouput;
  
  // TODO: double check this else-if statement
  if( (seedx2+'').lenght == ((seed+'') + (seed+'')).length ) {
    output = seedx2.slice(3,9);
  } else {
    let arr = ["0", "00", "000", "0000"];
    let pos = 12 - (seedx2+'').length;
    let zeros = arr[pos];
    output = (zeros + (seedx2+'')).slice(3,9);
  }
  return output * 1;
}


/**
 * Change the format of a string date
 * 
 * @params {String} d - the date in yyyy-mm-dd or mm-dd-yyyy format
 * return {String}
 */
function _format_date(d) {
  if(d.includes("-")) { // yyyy-mm-dd or mm-dd-yyyy
    let dt = d.split("-");
    if(dt[0].length == 4) { // yyyy-mm-dd
      return [dt[1], dt[2], dt[0]].join("/");
    } else {// mm-dd-yyyy
      return [dt[0], dt[1], dt[2]].join("/");
    }
  } else if(dt.includes("/")) { // mm/dd/yyyy
    return d;
  } else {
    return;
  }
}

/**
 * Capitalize a string
 * 
 * @params {String} s - the string to capitalize
 * return {String} the capitalized string or nothing
 * 
 * https://flaviocopes.com/how-to-uppercase-first-letter-javascript/
 */
const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const bool_months = [false, false, false, false, false, false, false, false, false, false, false, false];
const _months = ['Jan', 'Feb', 'Mar']