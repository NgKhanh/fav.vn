/**
 * ...
 * @author khacthanh.1985@gmail.com
 */
Template.numOnline.data = function(){	
	var online = {};
		online.all = UsersConnect.find({}).count();
		online.guest = UsersConnect.find({userId:'UNKNOW'}).count();
		online.mem = online.all - online.guest;
		
	return online;
}

Template.numOnline.created = function(){	
	console.log("-------------------------------------------> Template.onlineUser.created");	
}
	

Template.numOnline.rendered = function(){	
	console.log("-------------------------------------------> Template.onlineUser.rendered");	
}
	