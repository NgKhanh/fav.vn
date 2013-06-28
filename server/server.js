Meteor.publish("Album", function () { return Album.find({},{sort:{createTime:-1},limit:10}); });

Meteor.publish("OneAlbum", function (_roomID) { 
	return [	Album.find({_id:_roomID},{limit:1})
				,Message.find({roomID:_roomID})
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
		},

		createAlbum:function(_album){
			var album = Album.insert({				
										title 		: _album.title,
										genre 		: _album.genre,
										owner 		: _album.owner,
										policy		: _album.policy,
										createTime 	: Date.now(),
										liked		: 0,
										unlike		: 0,				
										playlist	:[],
										currentSong : 0,
										startSongTime:0,
										online		: 0
			})

			console.log("insert success", album);
			return album;
		},

		addSongToPlaylist:function(_song,_albumID){

			console.log(" ----> addSongToPlaylist", _song.title,_albumID);
			
			_song.createTime	=	Date.now();
			_song.liked			=	0;
			_song.unlike		=	0;
			_song.shareby		=	Meteor.user().profile.name;


			var album = Album.update({_id:_albumID},{$addToSet:{playlist:_song}});

			//return album.title;
		},

		searchMp3:function(_key){
			var result = Meteor.http.get("http://j.ginggong.com//jOut.ashx?code=7868d0b1-da9a-494c-80cd-5fcde436b0f2&h=nhaccuatui.com&k="+_key);

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

	})

})








