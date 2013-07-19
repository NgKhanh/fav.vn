Meteor.publish("Album", function (_step) { 
	// thêm 1 user online
	/*if(this.userId){
		console.log("user login ->>> ", this.userId);
	}else{
		console.log("one user in site");
	}
	// 1 user out 
	this._session.socket.on("close", function() {
		console.log("User out", this.userId);
	});*/
	
	return Album.find({policy:0},{sort:{createTime:-1},limit:10});	
});

Meteor.publish("myAlbum", function (_username) { 	
	return Album.find({"owner.username":_username},{sort:{createTime:-1}});	
});

Meteor.publish("OneAlbum", function (_roomID) { 
	return [	Album.find({_id:_roomID},{limit:1})
				,Message.find({roomID:_roomID})
				,Song.find({albumID:_roomID})
			]
});

Meteor.publish("MessageAndSong", function (_roomID) { 
	return [	Message.find({roomID:_roomID})
				,Song.find({albumID:_roomID})
			]
});


Meteor.startup(function(){

	/*Album.remove({});
	Song.remove({});
	Message.remove({});*/
	
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
		}

		,createAlbum:function(_album){
			
			var album = Album.insert({				
										title 		: _album.title
										,genre 		: _album.genre
										,owner 		:  {"name":Meteor.user().profile.name,"username":Meteor.user().username,"avatar":Meteor.user().profile.picture}
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

			})

			console.log("insert success", album);
			return album;
		}
		
		,updateAlbumCover:function(_cover,_albumID){
			Album.update({_id:_albumID},{$set :{cover:_cover}});
		}

		,addSongToPlaylist:function(_song,_albumID){

			console.log(" ----> addSongToPlaylist", _song.title,_albumID);
			
			Song.insert({	title		: _song.title
							,artist		: _song.artist	
							,shareBy	: {"name":Meteor.user().profile.name,"username":Meteor.user().username,"avatar":Meteor.user().profile.picture}
							,domain		:_song.domain
							,source		:_song.source
							,albumID 	:_albumID
							,createTime :Date.now()
							,like 		:0
							,unlike 	:0
			});
			
			Album.update({_id:_albumID},{ $inc: { numSong: 1 }});

		}
		
		,removeSongFromPlaylist:function(_songID,_albumID){
			console.log(" ----> remove song from list", _songID);
			Song.remove({_id:_songID});
			Album.update({_id:_albumID},{ $inc: { numSong: -1 }});
		}

		,searchMp3:function(_key){
			var result = Meteor.http.get("http://j.ginggong.com//jOut.ashx?code=7868d0b1-da9a-494c-80cd-5fcde436b0f2&k="+_key);

			console.log("#######################");
			console.log(result);
			console.log("#######################");

			return result.content;
		}
		
		,autoCompleteSearch:function(_key){
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
		}
		
		,getSongInfo:function(_id,_domain){
			var _url="";
			switch(_domain){
				case "mp3.zing.vn": _url = "http://mp3.zing.vn/bai-hat/-/"+_id+".html"; break;
				case "nhaccuatui.com": _url = "http://m.nhaccuatui.com/bai-hat/-."+_id+".html"; break;				
			}
			
			var result = Meteor.http.get(_url);
			var str = result.content;
			var data = {};
			if (str){
				switch(_domain){
					case "mp3.zing.vn": 
						data.source = str.substring(str.lastIndexOf("http://mp3.zing.vn/html5/song/"),str.lastIndexOf("http://mp3.zing.vn/html5/song/")+51);
					break;
					case "nhaccuatui.com": 
						data.source = str.substring(str.lastIndexOf('<source src="http://s82.stream.nixcdn.com'),str.lastIndexOf('.mp3" type="audio/mpeg">') + 4);
					break;				
				}
			}
						
			console.log("########## GET SOURCE #############");
			console.log(_id," >>> ",data);
			console.log("########## END GET SOURCE #############");
			
			return data;
		}
		
		
		
		,chat:function(_message,_roomID, _objectID){
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
			})
			
		}
		
		,sysMsg:function(_messageID,_roomID, _objectID){
			return Message.insert({
						owner 		: {"username":'SYS',"name":'SYS'}
						,sys 		: true
						,message 	: _messageID
						,objectID	: _objectID
						,roomID 	: _roomID
						,createTime : Date.now()
			})
		}

	})

})








