if (typeof(String.prototype.repeat) == "undefined") {

  String.prototype.repeat = function(count) {
    if (count < 1) return '';
    var result = '', pattern = this.valueOf();
    while (count > 0) {
      if (count & 1) result += pattern;
      count >>= 1, pattern += pattern;
    }
    return result;
  };
}

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}
