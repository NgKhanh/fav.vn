/**
 * ...
 * @author khacthanh.1985@gmail.com
 */


Meteor.startup(function(){

	/*Album.remove({});
	Song.remove({});
	Message.remove({});*/
	
	UsersConnect.remove({});
	
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
		
		,getCurrentTime:function(){
			//console.log('GET CURRENT TIME', Date.now());
			return Date.now();
		}
			
		,ImJoinRoom:function(roomID){				
			
			if(roomID !='' && Meteor.userId() && roomID == Meteor.user().currentRoom){
				// Vào lại cùng một phòng (có lẽ do refresh) > donothing
				Meteor._debug(Meteor.user().username + ' return this room!');
				return;
			}		
				
			// Kiểm tra phòng hiện tại	
			if(Meteor.userId() && Meteor.user().currentRoom!=""){
				// Thoát khỏi phòng hiện tại
				userExitRoom(Meteor.userId(),Meteor.user().currentRoom);
			}
			
			// Join vào phòng mới
			userJoinRoom(Meteor.userId(),roomID);
			
		}
		
		,createAlbum:function(_album){
			var _allowAddSong 		= _album.policy == 0 ? false :true; // Nếu public thì ko cho phép tự thêm bài hát
			var albumID = Album.insert({	 title 			: _album.title
											,genre 			: _album.genre
											,owner 			:  {"name":Meteor.user().profile.name,"username":Meteor.user().username,"avatar":Meteor.user().profile.picture}
											,policy			: _album.policy	 	// public show		
											,live			: true 				// play song same time
											,allowAddSong	: _allowAddSong 	// allow user add song to playlist
											,allowActiveSong: true 			// allow song enable
											,liked			: 0
											,unlike			: 0	
											,online			: 0
											,playlist		: []
											,numSong 		: 0
											,currentSong 	: 0
											,startSongTime	:0
											,cover			: _album.cover
											,createTime 	: Date.now()
			})

			console.log('>>',Meteor.user().username , ' create album' , _album.title);
			return albumID;
		}
		
		,updateAlbumInfo:function(_album){
			// Kiểm tra owner mới có quyền update
			var album = Album.findOne({_id:_album.id});
			if(album){				
				if(Meteor.userId() && Meteor.user().username == album.owner.username){
					
					try{
						Album.update({_id:_album.id}, {$set:{title:_album.title, policy:_album.policy, live:_album.live, allowAddSong:_album.allowAddSong, allowActiveSong : _album.allowActiveSong}});
					
						Meteor._debug(Meteor.user().username + " update album ", album._id);
					
						return album._id;
						
					}catch(e){
						Meteor._debug('update album err', e);
						return false;
					}
				}
			}
		}
		
		,updateAlbumCover:function(_cover,_albumID){
			Album.update({_id:_albumID},{$set :{cover:_cover}});
		}

		,addSongToPlaylist:function(_song,_albumID){
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

		}
		
		,allowSongToList:function(songID,albumID){
			if(Meteor.userId() == undefined || Meteor.userId() == null ) return false;
			//1. Check user is owner of Album
			//2. Check song in album
			var album = Album.findOne({_id:albumID});
			if(album==undefined)return false;
			if(Meteor.user().username!=album.owner.username)return false;
			
			var song = Song.findOne({_id:songID});
			if(song==undefined)return false;
			if(song.albumID!=albumID) return false;
			
			Song.update({_id:songID},{ $set: { ignore: false,createTime:Date.now()}});
		}
		
		,removeSongFromPlaylist:function(_songID,_albumID){
			if(Meteor.userId() == undefined || Meteor.userId() == null ) return false;
			console.log(Meteor.user().profile.name, " remove song from list", _songID);
			var song = Song.findOne({_id:_songID});
			Song.remove({_id:_songID});
			Album.update({_id:_albumID},{ $inc: { numSong: -1 }});
			
			Meteor.call('sysMsg',Meteor.user().profile.name + " vừa xóa bài bát :  " + song.title ,_albumID);
		}

		,searchMp3:function(_key){
			console.log(Meteor.user().profile.name, " search",_key);		
			var result = Meteor.http.get("http://j.ginggong.com//jOut.ashx?code=7868d0b1-da9a-494c-80cd-5fcde436b0f2&k="+_key);
			return result.content;
		}
		
		,autoCompleteSearch:function(_key){
			// auto complete search from zing.mp3
			var result = Meteor.http.get("http://mp3.zing.vn/suggest/search?term="+_key);
			if (result.content){
				return result.content;
			}else{
				
			}
			return result.content;
		}
		
		,getSongInfo:function(_id,_domain){
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
		}
		
		,changeCurrentMedia:function(roomID,nextSongID){
			
			if(nextSongID==null || nextSongID==undefined) return false;
			
			// Kiểm tra để chắc chắn user đăng nhập và đang trong phòng
			if(Meteor.userId()==undefined || Meteor.user().currentRoom=='') return false;
			
			var album = Album.findOne({_id:roomID});
			
			// Kiểm tra để chắc chắn user là admin
			if(Meteor.user().username!=album.owner.username) return false;
			
						// Nếu thỏa mãn các điều kiện > active bài hát mới
			Album.update({_id:roomID},{$set:{currentSong:nextSongID}});
			
			console.log(Meteor.user().username, "play song --> ",nextSongID);
			
			return nextSongID;
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
		
		,sysMsg:function(_messageID,_roomID){
			return Message.insert({
						owner 		: {"username":'SYS',"name":'SYS'}
						,sys 		: true
						,message 	: _messageID
						,roomID 	: _roomID
						,createTime : Date.now()
			})
		}

	})

})


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
}

