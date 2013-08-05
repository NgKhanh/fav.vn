/**
 * ...
 * @author khacthanh.1985@gmail.com
 */

Meteor.publish("OnlineUser", function () { 
	
	// thêm 1 user online	
	userJoinApp(this.userId, this._session.socket.id, this._session.socket.address.address );
	
	// 1 user out 
	this._session.socket.on("close", function() {
		userExitApp(this.id);
	});	
	
	return  UsersConnect.find({},{fields:{userId:1}});
});


userJoinApp = function(_userId, _socketID, _ip){
		
	if(_userId){
		// Nếu user đã đăng nhập > Kiểm tra xem đã tồn tại trong kết nối chưa (trường hợp mở nhiều tab)
		var uSid = UsersConnect.findOne({userId:_userId});
		
		var user = Meteor.users.findOne({_id:_userId});
		
		if(uSid){
			// User đã kết nối > chắc là mở thêm tab mới > update lại socketID mới 
			// TODO: DeAcgive Tab cũ, hiện thông báo để tắt tab ở client
			Meteor._debug(user.username + ' from IP: '+ _ip +  ' open newTab');	
			UsersConnect.update({userId: uSid.userId}, {$set:{socketID:_socketID, ip:_ip}});
		}else{
			// User lần đầu kết nối > thêm vào danh sách kết nối
			Meteor._debug(user.username + ' join app from IP: '+ _ip +  ' with socketID: '+ _socketID);	
			UsersConnect.insert({userId: _userId, socketID:_socketID, ip:_ip, currentRoom:''});
		}
		
	}else{
		// Nếu là khách vãng lai, chưa đăng nhập > Thêm vào, khỏi kiểm tra
		// TODO: Để kiểm tra khách vãng lai mở nhiều tab > check thêm IP, hoặc lưu cookie socketID
		_userId = 'UNKNOW';
		Meteor._debug(_userId + ' join app from IP: '+ _ip +  ' with socketID: '+ _socketID);
		UsersConnect.insert({userId: _userId, socketID:_socketID, ip:_ip, currentRoom:''});
	}
	
}

userExitApp = function(_socketID){
	
	Fiber(function() {	
			
			// GET userId in connection list
			var uSid = UsersConnect.findOne({socketID:_socketID});
						
			// Remove khỏi danh sách kết nối
			UsersConnect.remove({socketID:_socketID});	
			
		
			if(uSid==undefined || uSid==null){
				// Trường hợp này có thể do user chỉ tắt 1 tab (Tab cũ), vẫn còn active tab mới mở
				Meteor._debug('Not found user in this connection ' + _socketID);
				return;
			}
			
			
			if(uSid.userId=="UNKNOW"){
				// Khách vãng lai vừa out
				// TODO: Xem nếu user đang trong phòng > remove khỏi phòng đó ? Làm sao biết???
				Meteor._debug('GUEST exit app from connection ' + _socketID);
				
			}else{			
				// Chờ một khoảng thời gian, kiểm tra lại danh sách kết nối với userId vừa thoát. Nếu tồn tại > user vừa vào lại			
				Meteor.setTimeout(function(){
					
					// Lấy toàn bộ thông tin của user dựa trên userId
					var user = Meteor.users.findOne({_id:uSid.userId});					
					
					// Sau 3s kiểm tra lại thông tin user trong danh sách kết nối > Nếu vẫn tồn tại > user vừa vào trở lại
					var newSid = UsersConnect.findOne({userId:uSid.userId});					
					
					if(newSid){
						// User vẫn tồn tại >> user đã vào lại chỉ trong 3s, chắc là reFresh
						console.log('>>',user.username, ' --> just refresh');
					}else{							
						// Nếu ko tìm thấy thông tin mới>  chắc là user đã out luôn rồi > do something else
						console.log('>>',user.username, ' --> exit app');
						
						userExitRoom(user._id, user.currentRoom);
					}	
				},3000);		
			}			
		}).run(); 	
}

userJoinRoom = function(_userId, _roomID){
	
	Meteor._debug('Debug > ' +_userId + " join room " + _roomID);
	
	if(_userId){
		// Mem vào phòng
		var user = Meteor.users.findOne({_id:_userId});
		var room = Album.findOne({_id:_roomID});
		
		if(room){
			if(room.owner.username == user.username){
				//TODO Nếu là chủ phòng > chuyển trạng thái phòng sang live = true
				//Album.update({_id:_roomID}, {$set:{live:true}});
				Meteor._debug(user.username + ' join his room ' + room.title);	
			}else{
				Meteor._debug(user.username + ' join room ' + room.title);	
			}
			
			// Update currentRoom cho user
			Meteor.users.update({_id:user._id}, {$set:{currentRoom:_roomID}});
			
			// Thông báo một member vào phòng	
			Meteor.call("sysMsg",user.profile.name + ' vừa vào', _roomID);
			
		}else{
			Meteor._debug('Exception: Album ' + _roomID + ' not found!');
		}
	}else{
		// Thông báo một khách vào phòng		
		Meteor.call('sysMsg', 'Một khách vừa vào' , _roomID);
	}
}


userExitRoom = function(_userId, _roomID){
	//1. Kiểm tra xem user có trong phòng không
	//2. Kiểm  tra xem user có phải admin không
	// 	 	> Nếu phải > chuyển trạng thái phòng
	//		> Nếu không > thì thôi
	//3. Dù là admin hay không thì cũng set currentRoom về rỗng
	
	if(_userId){
		var user = Meteor.users.findOne({_id:_userId});
		
		if(user.currentRoom !='' && user.currentRoom == _roomID){
			// user đang ở trong phòng			
			var room = Album.findOne({_id:_roomID});
			if(room){
				if(room.owner.username == user.username){
					//Nếu là chủ phòng > chuyển trạng thái phòng sang live = false
					Album.update({_id:_roomID}, {$set:{live:false}});
				}
				
				Meteor._debug(user.username + ' just exit room ' + room.title);			
				
			}else{
				Meteor._debug('Exception: Album ' + _roomID + ' not found!');
			}
		}else{
			Meteor._debug('Exception: ' + user.username + ' not in room ');		
		}
		
		Meteor.users.update({_id:user._id}, {$set:{currentRoom:''}});
		
		//TODO: Hiện thông báo user exit room;
		Meteor.call('sysMsg', user.profile.name + ' vừa ra khỏi phòng' , _roomID);
	}else{
		// Thông báo một khách vào phòng		
		Meteor.call('sysMsg', 'Một khách vừa ra khỏi phòng' , _roomID);
	}	
}
