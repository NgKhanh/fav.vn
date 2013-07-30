title2Alias = function (s) {
  if (typeof s === undefined)  return;
 
  var i = 0, arr, newclean = s;
  
  arr = ["à","á","ạ","ả","ã","â","ầ","ấ","ậ","ẩ","ẫ","ă","ằ","ắ","ặ","ẳ","ẵ","À","Á","Ạ","Ả","Ã","Â","Ầ","Ấ","Ậ","Ẩ","Ẫ","Ă","Ằ","Ắ","Ặ","Ẳ","Ẵ","A"];
  for (i=0; i<arr.length; i++) newclean = newclean.replace(arr[i],'a');
  
  arr = ["è","é","ẹ","ẻ","ẽ","ê","ề","ế","ệ","ể","ễ","È","É","Ẹ","Ẻ","Ẽ","Ê","Ề","Ế","Ệ","Ể","Ễ","E"];
  for (i=0; i<arr.length; i++) newclean = newclean.replace(arr[i],'e');
  
  arr = ["ì","í","ị","ỉ","ĩ","Ì","Í","Ị","Ỉ","Ĩ","I"];
  for (i=0; i<arr.length; i++) newclean = newclean.replace(arr[i],'i');
    
  arr = ["ò","ó","ọ","ỏ","õ","ô","ồ","ố","ộ","ổ","ỗ","ơ","ờ","ớ","ợ","ở","ỡ","Ò","Ó","Ọ","Ỏ","Õ","Ô","Ồ","Ố","Ộ","Ổ","Ỗ","Ơ","Ờ","Ớ","Ợ","Ở","Ỡ","O"];
  for (i=0; i<arr.length; i++) newclean = newclean.replace(arr[i],'o');
 
  arr = ["ù","ú","ụ","ủ","ũ","ư","ừ","ứ","ự","ử","ữ","Ù","Ú","Ụ","Ủ","Ũ","Ư","Ừ","Ứ","Ự","Ử","Ữ","U"];
  for (i=0; i<arr.length; i++) newclean = newclean.replace(arr[i],'u');
 
  arr = ["ỳ","ý","ỵ","ỷ","ỹ","Ỳ","Ý","Ỵ","Ỷ","Ỹ","Y"];
  for (i=0; i<arr.length; i++) newclean = newclean.replace(arr[i],'y');
  
  arr = ["d","Đ","D"]; 
  for (i=0; i<arr.length; i++) newclean = newclean.replace(arr[i],'d');
  
  /* arr = [".","=",")","(","|","!","~",">","<",":","!","^","%","#","*","&","+"]; 
  for (i=0; i<arr.length; i++) newclean = newclean.replace(arr[i],''); */
  
  return newclean.replace(/\./g,'').newclean.toLowerCase().newclean.replace(/[\&]/g, '-and-').replace(/[^a-zA-Z0-9._-]/g, '-').replace(/[-]+/g, '-').replace(/-$/, '');
};
//end 
//file server/helper/helper.js