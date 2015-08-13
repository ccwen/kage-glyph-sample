
//內碼轉字
var ucs2string = function (unicode) { //unicode ���X�� �r���A�textension B ���p
    if (unicode >= 0x10000 && unicode <= 0x10FFFF) {
      var hi = Math.floor((unicode - 0x10000) / 0x400) + 0xD800;
      var lo = ((unicode - 0x10000) % 0x400) + 0xDC00;
      return String.fromCharCode(hi) + String.fromCharCode(lo);
    } else {
      return String.fromCharCode(unicode);
    }
};
//取得字元的utf32 值
var getutf32 = function (opt) { // return ucs32 value from a utf 16 string, advance the string automatically
  if (!opt.widestring) return 0;
  var s = opt.widestring;
  var ic = s.charCodeAt(0);
  var c = 1; // default BMP one widechar
  if (ic >= 0xd800 && ic <= 0xdcff) {
    var ic2 = s.charCodeAt(1);
    ic = 0x10000 + ((ic & 0x3ff) * 1024) + (ic2 & 0x3ff);
    c++; // surrogate pair
  }
  opt.thechar = s.substr(0, c);
  opt.widestring = s.substr(c, s.length - c);
  return ic;
};

module.exports={getutf32:getutf32,ucs2string:ucs2string};