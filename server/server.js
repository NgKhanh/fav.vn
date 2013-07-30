Meteor.headly.config({tagsForRequest: function(req) {
	var url = Npm.require('url'); 
	
	var parts = url.parse(req.url).pathname.split('/');
	
	var meta='';
		meta += '<meta property="og:site_name" content="FAVorite music" />';
	
		
	if(parts.length>1){
		// re turn custome
		if(parts[3] && parts[3]!='' && parts[1]=="a"){
			var media = Song.findOne({_id:parts[3]}); 
				if(media==undefined) return meta;
				
			var album = Album.findOne({_id:media.albumID});
				if(album==undefined) return meta;
			
			if(media.domain == 'youtube.com')
				meta += '<meta property="og:image" 		content="http://i1.ytimg.com/vi/'+media.mID+'/hqdefault.jpg"/>';
			else
				meta += '<meta property="og:image" 		content="http://fav.vn'+getCoverAlbum(album.genre)+'"/>';
				
			meta += '<meta property="og:url" 		content="http://fav.vn/a/'+parts[2]+'/'+media._id+'" />';
			meta += '<meta property="og:title" 		content=" '+media.title+' trong playlist '+album.title +' - '+album.owner.name+'"/>';
			meta += '<meta property="og:description" content="Nghe nhạc và chia sẻ cảm xúc cùng '+album.owner.name+' tại FAV.VN" />';
		}else{
			
			switch(parts[1]){
				case "a" :
					var _albumID = parts[2].substring( parts[2].lastIndexOf(".")+1,parts[2].length);
					var _album = Album.findOne({_id:_albumID});
					
						if(_album == undefined) return meta;
					
					meta += '<meta property="og:url" 		content="http://fav.vn/a/'+parts[2]+'" />';
					meta += '<meta property="og:image" 		content="http://fav.vn'+getCoverAlbum(_album.genre)+'"/>';
					meta += '<meta property="og:title" 		content="Album: '+_album.title+' - tạo bởi '+_album.owner.name+'"/>';
					meta += '<meta property="og:description" content="Nghe nhạc và chia sẻ cảm xúc cùng '+_album.owner.name+' tại FAV.VN" />';
				break;			
			}
		}
	}else{
		// return default
		meta += '<meta property="og:url" 			content="http://fav.vn" />';		
		meta += '<meta property="og:image" 			content="/img/tcs.jpg"/>';
		meta += '<meta property="og:title" 			content="FAV.VN - FAVorite music"/>';
		meta += '<meta property="og:description" 	content="Trang web nghe nhạc dành cho người tự kỉ cấp độ cao nhất nhất" />';
	}
	
  return meta;
}});

Meteor.publish("Album", function (_step) { 
	// thêm 1 user online
	if(!this.userId){		
		console.log(this.userId, " --> login",this._session.socket._session.session_id);
	}
	
	this._session.socket.on("connection", function() {
		console.log("###################### SOCKET CONNECTION #############################");
		//console.log('---->',this._session);	
		//console.log('---->',this.meteor_session.userId );
		//console.log("##################### END SOCKET ON ###########################");
		
	});
	
	
	// 1 user out 
	this._session.socket.on("close", function() {
		/**
			1. Lấy và lưu lại thông tin user dựa vào socket sessionID
			2. Remove record chứa thông tin user dựa trên socket sessionID
			3. Delay 3s : trong khoảng thời gian này nếu user vào lại > sẽ được cấp sessionID mới
			4. Sau 3s sẽ kiểm tra lại record chứa thông tin user
				> nếu tìm thấy nghĩa là user đã trở lại
				> Nếu không tìm thấy > user đã thoát hẳn khỏi ứng dụng
			
		*/
		
		var sessionID = this._session.session_id;
		
		Fiber(function() {				
			//remove this record			
			var uSid = UserSession.findOne({sID:sessionID});
			
			console.log("###################### SOCKET CLOSE ############################# ->",uSid);
		
			if(uSid){				
				UserSession.remove({sID:sessionID});					
				Meteor.setTimeout(function(){
					var newSid = UserSession.findOne({userId:uSid.userId});					
							
					if(newSid){
						// User vẫn tồn tại >> user đã vào lại chỉ trong 3s, chắc là reFresh
						console.log("User co id", newSid.userId, 'vua fresh');
					}else{						
						
						var _user = Meteor.users().findOne({_id:uSid});
						// Nếu ko tìm thấy thông tin mới>  chắc là user đã out luôn rồi > do something else
						console.log(_user.profile.username, '---> vua out khoi ung dung');
						
						/** 
							1.Set lại currentRoom của phòng này là rỗng
							2.Kiểm tra xem user này phải chủ phòng nào hay không
							2.Tìm user vào phòng này lâu nhất > set Admin cho nó
						
						*/
						
						var _currentRoom = _user.currentRoom;
						
						if(_currentRoom!=''){
							// set currentRoom = rỗng
							Meteor.users().update({_id:_user.userId},{$set:{currentRoom:''}});						
							
							// Tìm user vào phòng lâu nhất							
							var newAdmin = Meteor.findOne({currentRoom:_currentRoom});
							
							// Nếu tìm ra newAdmin >> set cho nó 
							if(newAdmin)Meteor.call('setAdminRoom', _currentRoom);
							
						}
					}	
				},3000);		
			}			
		}).run(); 	
		
	});
	
	return [	Album.find({policy:0},{sort:{createTime:-1},limit:_step})
				,Meteor.users.find({currentRoom:{ $ne: "" }},{fields:{username:1,profile:1,role:1,currentRoom:1}})
			];
});


Meteor.publish("myAlbum", function (_username) { 
	
	var sessionID = this._session.socket._session.session_id;
	var uSid = UserSession.findOne({userId:this.userId});
	
	console.log("###################### LOGIN #############################",this.userId," > sessionID >" ,sessionID);
		
	if(uSid){
		// Nếu user đã tồn tại > trường hợp mở tab mới > không thêm record nữa, cũng ko đếm để tăng user
		// Hoặc có thể close connection cũ > chỉ active 1 tab mới mà thôi
	}else{
		// Nếu chưa tồn tại >> vừa trở vào App > add thông tin vào DB
		console.log("add User to UserSession as Dictionnay");
		UserSession.insert({sID:sessionID, userId:this.userId});
	}
	
	return Album.find({"owner.username":_username},{sort:{createTime:-1}});	
});

Meteor.publish("OneAlbum", function (_roomID) { 
	return [	Song.find({albumID:_roomID})
				,Message.find({roomID:_roomID})				
				,Meteor.users.find({},{fields:{username:1,profile:1,role:1,currentRoom:1}})
			];
});

Meteor.publish("MessageAndSong", function (_roomID) {	
	return [	Message.find({roomID:_roomID})				
				,Meteor.users.find({},{fields:{username:1,profile:1,role:1,currentRoom:1}})
			];
});


Meteor.startup(function(){

	/*Album.remove({});
	Song.remove({});
	Message.remove({});*/
	
	UserSession.remove({});
	
	//__meteor_runtime_config__.ROOT_URL = "http://fav.vn";
	
	Meteor.methods({
		testServerCall:function(){
			
			var mp3="hello";

			//var result = Meteor.http.call("GET",_link);
			var result = Meteor.http.get("http://mp3.zing.vn/bai-hat/Mua-Nua-Dem-Le-Quyen/ZWZ9ZI7I.html");

			if(result.content){
				if(result.content.lastIndexOf("xmlURL") > -1){
					
					var xmlURL = result.content.substring(result.content.lastIndexOf("xmlURL")+7,result.content.lastIndexOf("textad=http://")-5);
					
					var data = Meteor.http.get(xmlURL);

						if(data){							
						 	mp3 =  data.content.substring(data.content.lastIndexOf("<source><![CDATA[http://stream") + 17,data.content.lastIndexOf(".mp3]]></source>")+4);		
							return mp3;
						}
				}
			}		

			return mp3;
		},
		
		getCurrentTime:function(){
			console.log('GET CURRENT TIME', Date.now());
			return Date.now();
		},
			
		ImJoinRoom:function(roomID){		
			if(Meteor.userId()){
				
				// Kiểm tra phòng hiện tại > thông báo thoát khỏi phòng
				if(Meteor.user().currentRoom!=""){
					
					//TODO: Set lại admin cho user khác
					
					Meteor.call("sysMsg", Meteor.user().profile.name + ' ra khỏi phòng' , Meteor.user().currentRoom);
				}
				// Update phòng mới
				Meteor.users.update({_id:Meteor.userId()},{$set:{currentRoom:roomID}});	
				
				//TODO: Kiểm tra nếu là tôi Owner của phòng > set lại Admin
			}
			
			var _sysMsg = '';
			if(Meteor.userId())	_sysMsg = Meteor.user().profile.name + ' vừa mới vào';
			else 				_sysMsg = 'Có một khách không biết tên vừa mới vào';			
			Meteor.call("sysMsg", _sysMsg , roomID);
		},
		
		userExitRoom:function(roomID){			
			if(Meteor.userId()){
				Meteor.users.update({_id:Meteor.userId()},{$set:{currentRoom:''}});					
			}
			
			var _sysMsg = '';
			if(Meteor.userId())	_sysMsg = Meteor.user().profile.name + ' ra khỏi phòng';
			else 				_sysMsg = 'Có một khách không biết tên vừa ra khỏi phòng';			
			Meteor.call("sysMsg", _sysMsg , roomID);
			
			//TODO: Kiểm tra nếu là Owner của phòng > set quyền Admin cho người khác
		},
		
		adminMyRoom:function(){
			if(Meteor.userId()){
				// find albumID
				var _album = Album.findOne({_id:roomID});
				if(_album && _album.owner.username==Meteor.user().username){
					// Nếu là album tôi tạo ra >> xác thực admin
					Album.update({_id:roomID},{$set:{admin:{username:Meteor.user().username,name:Meteor.user().profile.name}}});
				}
			}
		},
		
		setAdminRoom:function(roomID){
			//TODO: Tìm tất cả user trong phòng này. đứa vào vào lâu nhất > set Admin cho nó
			
			
			/*if(Meteor.userId() && Meteor.user().currentRoom!=''){				
				// find albumID
				var _album = Album.findOne({_id:Meteor.user().currentRoom});
				if(_album){
					// Nếu là album tôi tạo ra >> xác thực admin
					Album.update({_id:roomID},{$set:{admin:{username:Meteor.user().username,name:Meteor.user().profile.name}}});
				}
			}*/
		},

		createAlbum:function(_album){
			
			var album = Album.insert({				
										title 		: _album.title
										,genre 		: _album.genre
										,owner 		:  {"name":Meteor.user().profile.name,"username":Meteor.user().username,"avatar":Meteor.user().profile.picture}
										,admin 		:  {"name":Meteor.user().profile.name,"username":Meteor.user().username,"avatar":Meteor.user().profile.picture}
										,policy		: _album.policy
										,cover		: _album.cover
										,createTime : Date.now()
										,liked		: 0
										,unlike		: 0			
										,playlist	: []
										,numSong 	: 0
										,currentSong : 0
										,startSongTime:0
										,online		: 0

			});

			console.log(Meteor.user().profile.name , " create album", _album.title);
			return album;
		},
		
		updateAlbumCover:function(_cover,_albumID){
			Album.update({_id:_albumID},{$set :{cover:_cover}});
		},

		addSongToPlaylist:function(_song,_albumID){
			Song.insert({	title		: _song.title
							,mID		: _song.mID	
							,artist		: _song.artist	
							,ignore		:_song.ignore
							,shareBy	: {"name":Meteor.user().profile.name,"username":Meteor.user().username,"avatar":Meteor.user().profile.picture}
							,domain		:_song.domain
							,source		:_song.source
							,image      :''
							,albumID 	:_albumID
							,createTime :Date.now()
							,like 		:0
							,unlike 	:0							
			});
			
			Album.update({_id:_albumID},{ $inc: { numSong: 1 }});
			
			Meteor.call('sysMsg',Meteor.user().profile.name + " vừa thêm bài bát :  " + _song.title ,_albumID,_song.mID);

		},
		
		allowSongToList:function(songID,albumID){
			if(Meteor.userId()==undefined) return false;
			//1. Check user is owner of Album
			//2. Check song in album
			var album = Album.findOne({_id:albumID});
			if(album==undefined)return false;
			if(Meteor.user().username!=album.owner.username)return false;
			
			var song = Song.findOne({_id:songID});
			if(song==undefined)return false;
			if(song.albumID!=albumID) return false;
			
			Song.update({_id:songID},{ $set: { ignore: false,createTime:Date.now()}});
		},
		
		removeSongFromPlaylist:function(_songID,_albumID){
			console.log(Meteor.user().profile.name, " remove song from list", _songID);
			var song = Song.findOne({_id:_songID});
			Song.remove({_id:_songID});
			Album.update({_id:_albumID},{ $inc: { numSong: -1 }});
			
			Meteor.call('sysMsg',Meteor.user().profile.name + " vừa xóa bài bát :  " + song.title ,_albumID);
		},

		searchMp3:function(_key){
			console.log(Meteor.user().profile.name, " search",_key);		
			var result = Meteor.http.get("http://j.ginggong.com//jOut.ashx?code=7868d0b1-da9a-494c-80cd-5fcde436b0f2&k="+_key);
			return result.content;
		},
		
		autoCompleteSearch:function(_key){
			// auto complete search from zing.mp3
			var result = Meteor.http.get("http://mp3.zing.vn/suggest/search?term="+_key);
			if (result.content){
				//console.log("############### KET QUA TRA VE ###############");
				//console.log(result.content);
				//console.log("############### END >> KET QUA TRA VE ###############");
				return result.content;
			}else{
				
			}
			return result.content;
		},
		
		getSongInfo:function(_id,_domain){
			var _url="";
			switch(_domain){
				case "mp3.zing.vn": 	_url = "http://mp3.zing.vn/bai-hat/-/"+_id+".html"; break;
				case "nhaccuatui.com": 	_url = "http://m.nhaccuatui.com/bai-hat/-."+_id+".html"; break;				
				case "youtube.com": 	_url = "http://www.youtube.com/watch?v="+_id; break;				
			}
			
			console.log("--------------> get info from url", _domain, _id, _url);
			
			var result = Meteor.http.get(_url);
			var str = result.content;
			var data = {};
			if (str){
				switch(_domain){
					case "mp3.zing.vn": 
						data.source = str.substring(str.lastIndexOf("http://mp3.zing.vn/html5/song/"),str.lastIndexOf("http://mp3.zing.vn/html5/song/")+51);
						data.title 	= str.substring(str.lastIndexOf("<title>")+7, str.lastIndexOf("</title>"));
						data.title 	= data.title.substring(0,data.title.lastIndexOf('|'));
						
						data.artist	= data.title.substring(data.title.lastIndexOf('-')+1,data.title.length);
						data.title 	= data.title.substring(0,data.title.lastIndexOf('-'));
						
					break;
					case "nhaccuatui.com": 
						data.source = str.substring(str.lastIndexOf('.stream.nixcdn.com')-10,str.lastIndexOf('.mp3') + 4);
						
						data.title = str.substring(str.lastIndexOf("<title>")+7, str.lastIndexOf("</title>"));
						data.title 	= data.title.substring(0,data.title.indexOf('-'));
						
						data.artist = str.substring(str.lastIndexOf("<title>")+7, str.lastIndexOf("</title>"));
						data.artist = data.artist.substring(data.artist.indexOf("-")+1, data.artist.lastIndexOf("-"));
						data.artist = data.artist.substring(0, data.artist.lastIndexOf("-"));
					break;	
					
					case "youtube.com": 
						data.source = _id;
						data.title 	= str.substring(str.lastIndexOf("<title>")+7, str.lastIndexOf("</title>"));
						data.title 	= data.title.substring(0,data.title.lastIndexOf('-') - 1);			
						data.artist	= '';					
					break;
				}
			}
			
			console.log(Meteor.user().profile.name," add link from", _domain, " > ",_id);			
			return data;
		},
    
		changeCurrentMedia: function(roomID,nextSongID){
			
			if(nextSongID==null || nextSongID==undefined) return false;
			
			// Kiểm tra để chắc chắn user đăng nhập và đang trong phòng
			if(Meteor.userId()==undefined || Meteor.user().currentRoom=='') return false;
			
			var album = Album.findOne({_id:roomID});
			
			// Kiểm tra để chắc chắn user là admin
			if(Meteor.user().username!=album.owner.username) return false;
			
						// Nếu thỏa mãn các điều kiện > active bài hát mới
			Album.update({_id:roomID},{$set:{currentSong:nextSongID}});
			
			console.log(Meteor.user().username, "Update new song ---> ",nextSongID);
			
			return nextSongID;
		},
		
		chat: function(_message,_roomID, _objectID){
			//var user = ["KhacThanh","KhanhNguyen","BaTung","LeY","LeNhu","KhoaDo","ThienNguyen"];
			var user = ["KhacThanh","ThienNguyen"];
			var ran = parseInt(Math.random()*user.length);
			var _userID = user[ran];
			
			// find lastest chat
			
			return Message.insert({
						owner 		: {"username":Meteor.user().username,"name":Meteor.user().profile.name,"avatar":Meteor.user().profile.picture}
						,message 	: _message
						,objectID	: _objectID
						,roomID 	: _roomID
						,createTime: Date.now()
			});
			
		},
		
		sysMsg:function(_messageID,_roomID){
			return Message.insert({
						owner 		: {"username":'SYS',"name":'SYS'}
						,sys 		: true
						,message 	: _messageID
						,roomID 	: _roomID
						,createTime : Date.now()
			});
		}

	});

});

getCoverAlbum = function(_genre){
	_genre = title2Alias(_genre);
	
	switch(_genre){
		
		case "tonghop":
		case "tong-hop":
			return "/covers/nhactre.jpg"; break
			
		case "nhactrinh":
		case "nhac-trinh":
			return "/covers/Trinh1.jpg"; break
			
		case "trutinh":
		case "tru-tinh":
			return "/covers/trutinh2.jpg" || "/covers/trutinh2.png"; break;
			
		case "nhactre":
		case "nhac-tre":
			return "/covers/nhactre.jpg"; break;
		
		case "nhacvang":
		case "nhac-vang":
			return "/covers/nhacvang1.jpg" || "/covers/nhacvang.jpg"; break;		
		
		case "nhacdo":
		case "nhac-do":
			return "/covers/nhac-do.jpg"; break;		
		
		case "cailuong":
		case "cai-luong":
			return "/covers/cai-luong.jpg"; break;
			
		case "rock":		
			return "/covers/rock3.jpg" || "/covers/rock2.jpg"||  "/covers/rock1.jpg"; break;
			
		case "piano":		
			return "/covers/piano.jpg"; break;
		
		case "guitar":		
			return "/covers/guitar.jpg"; break;
		
		default:
			return "/covers/cover.jpg";break;
		
	}
};



