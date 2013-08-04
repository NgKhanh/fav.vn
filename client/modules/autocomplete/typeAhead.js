/**
 * ...
 * @author khacthanh.1985@gmail.com
 */

Template.addSongInput.data = function(){
	if(Session.get('currentRoom')!=''){
		
		var _album =  Album.findOne({_id:Session.get("currentRoom")});	
			_album.allow = false;
			
			if(Meteor.userId()==undefined){
				// Nếu không đăng nhập > ko hiện ra luôn
				_album.allow = false;
				return _album;
			}
			
			if(Meteor.user().username == _album.owner.username || _album.allowAddSong==true){
				// Nếu là owner hoặc cho phép > hiện ra cho phép add
				console.log('---------------------> allow add song');
				_album.allow = true;
				return _album;
			}
			
		return _album;
	}
}
 
Template.addSongInput.created=function(){		
	console.log('Template addSongInput created');
}

Template.addSongInput.rendered=function(){
	console.log('Template addSongInput rendered');
	initTypeAHead();
}


checkURL = function(str){
	
	str = str.replace(".html","");
	
	var urlObj			=	{};
		urlObj.idUrl	=	true;
		urlObj.domain	=	'';
	
	if(	str.lastIndexOf("nhaccuatui.com")>-1){
		urlObj.domain	=	'nhaccuatui.com';		
		urlObj.ID = str.substring(str.lastIndexOf(".") + 1,str.length);
		
	}else if( str.lastIndexOf("mp3.zing.vn")>-1){
		urlObj.domain	=	'mp3.zing.vn';		
		urlObj.ID = str.substring(str.lastIndexOf("/") + 1,str.length);
		
	}else if(   str.lastIndexOf("nhacso.net")>-1){
		urlObj.domain	=	'nhacso.net';
		urlObj.ID = str.substring(str.lastIndexOf(".") + 1,str.length);
	
	}else if( str.lastIndexOf("keeng.vn")>-1){
		urlObj.domain	=	'keeng.vn';	
		urlObj.ID = str.substring(str.lastIndexOf("/") + 1,str.length);
	
	}else if( str.lastIndexOf("youtube.com")>-1){
		urlObj.domain	=	'youtube.com';
		urlObj.ID = str.substring(str.lastIndexOf("watch?v=") + 8,str.length);		
	}else{
		urlObj.idUrl	=	false;
	}
	
	//console.log("-------------->", urlObj.ID);
	
	return urlObj;
}

var timeOut;

initTypeAHead=function(){ 

	var searchkey="";
	var resultData=[];
	
	
	$('#searchInput').typeahead({
		items:10,
		minLength:3,
		source: function(query,process){
			
			map = {};
			
			var objUrl = checkURL(query);	
			
			if(objUrl.idUrl){
				// Nếu paste vào 1 url > parseURL
				Meteor.call('getSongInfo',objUrl.ID, objUrl.domain, function(err,song){
					if(song){											
						var result = [];						
						song.id		= objUrl.ID;
						song.domain = objUrl.domain;
						song.name 	= (song.title.lastIndexOf("+")>-1)?song.title.substring(0,song.title.lastIndexOf("+")):song.title;	
						
						map[song.title] = song;
						result.push(song.title);
						
						resultData = result;						
						return process(result);
					}
				});
				
			}else{
			
				window.clearTimeout(timeOut);
				timeOut = window.setTimeout(function(){
				
				
					Meteor.call("searchMp3",query,function(err,res){
						
					//Meteor.call("autoCompleteSearch",query,function(err,res){
						if(res){
							var data = $.parseJSON(res);						
							var result = [];
							
							//console.log("search complete",query,data);
							
							// search from j.search api
							$.each(data, function (i, song) {
								if(i<10){															
									song.id 		= song.Id;														
									song.title 		= song.Id;														
									song.artist 	= song.Artist;	
									song.domain 	= song.HostName;						
									song.name 		= (song.Title.lastIndexOf("+")>-1)?song.Title.substring(0,song.Title.lastIndexOf("+")):song.Title;	
									song.source 	= song.UrlJunDownload;						
														
									map[song.title] = song;
									result.push(song.title);
								}	
							});		
							
							// search from zing
							/*$.each(data.song.list, function (i, song) {
								if(i<10){															
									if(song.name.lastIndexOf("+")>-1)song.name = song.name.substring(0,song.name.lastIndexOf("+"));	
									song.title = song.object_id;	
									song.domain = "mp3.zing.vn";							
									map[song.title] = song;
									result.push(song.title);
								}	
							});	*/			
							resultData = result;
							
							return process(result);
						}
					})
					
				},1000); 
			}
		},
		
		updater:function (item) {
			
			var _song={};						
				_song.title 	= map[item].name;
				_song.artist 	= map[item].artist;
				_song.domain 	= map[item].domain;
				_song.source  	= map[item].source;
				_song.mID  		= map[item].id;
				_song.ignore	= Session.get('isAdmin')?false:true;
				
			var album = Album.findOne({_id:Session.get('currentRoom')});
				// Nếu là Admin hoặc album cho phép > active luôn khỏi duyệt
				_song.ignore = album.allowActiveSong == true || isAdmin() == true?false:true;
			
			Meteor.call("addSongToPlaylist",_song,Session.get("currentRoom"),function(err,res){				
				console.log(">> addSongToPlaylist success");
				$('#searchInput').val('');				
			});
			
			return _song.title + " - "+ _song.artist;
					
			/*Meteor.call("getSongInfo",map[item].object_id, map[item].domain,function(err, res){
				if(res){
					
					var _song={};						
						_song.title 	= map[item].name;
						_song.artist 	= map[item].artist;
						_song.domain 	= map[item].domain;
						_song.source  	= res.source;
						
					
					Meteor.call("addSongToPlaylist",_song,Session.get("currentRoom"),function(err,res){
						if(res){
							console.log(">> addSongToPlaylist success");
						}
					});
					
				}				
			});
			
			return map[item].name + " - "+map[item].artist;*/	
		},

		highlighter: function (item) {
			if(map[item].artist!="")
				return '<span class="pull-left">' + map[item].name + ' </span><span class="pull-left">  - '+map[item].artist+'</span>' + '<small class="pull-right" style="color:#ddd">'+map[item].domain+'</small>';		
			else 
				return '<span class="pull-left">' + map[item].name + ' </span>  <small class="pull-right" style="color:#ddd">'+map[item].domain+'</small>';			
		}
	});

}
