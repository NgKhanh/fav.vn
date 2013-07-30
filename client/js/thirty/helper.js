timeAgo = function (time){
	var t="timeAgo";
	
	var _second = parseInt((Date.now() - time)/1000);
	var _min    = parseInt( _second/60);
	var _hour   = parseInt(_second/3600);
	var _day	  = parseInt(_hour/24);
	
	var _time = new Date(time);

  //console.log("> time ago",_second,_min,_hour,_day);
	
	if(_second<60)
		  return t = "vừa mới đây";
	if(_second <3600)
		return t = "cách đây "+_min+" phút";
	if(_hour <24)
		return t = 'vào lúc '+_time.getHours()+':' + _time.getMinutes();
	if(_day <30)
		  return t = "cách đây " + _day +" ngày";
	if(_day >30)
      return t = "tháng trước";
}

title2Alias = function (s) {
  if (typeof s == "undefined")  return;
 
  var i=0,arr;
  var newclean=s;
  
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
  
  newclean = newclean.replace(/\./g,'');
  
  newclean = newclean.toLowerCase()
  ret = newclean.replace(/[\&]/g, '-and-').replace(/[^a-zA-Z0-9._-]/g, '-').replace(/[-]+/g, '-').replace(/-$/, '');
 
  return ret;
} 

String.prototype.safeString=function(){
	var tag = ['<script','</script','</', '/>','<','>'];	
	var self=this;
	for(var i=0;i<tag.length;i++){	
		self = self.replaceAll(tag[i],'');
	}
	return self.toString();
}

String.prototype.replaceAll = function(stringToFind,stringToReplace){
    var temp = this;
    var index = temp.indexOf(stringToFind);
        while(index != -1){
            temp = temp.replace(stringToFind,stringToReplace);
            index = temp.indexOf(stringToFind);
        }
	return temp.toString();
}