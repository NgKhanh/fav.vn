/**
 * ...
 * @author khacthanh.1985@gmail.com
 */

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
							
							console.log("search complete",query,data);
							
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
					
				},300); 
			}
		},
		
		updater:function (item) {
			console.log("select item >>",item,map[item].id);
			
			var _song={};						
				_song.title 	= map[item].name;
				_song.artist 	= map[item].artist;
				_song.domain 	= map[item].domain;
				_song.source  	= map[item].source;
				_song.mID  		= map[item].id;
			
				Meteor.call("addSongToPlaylist",_song,Session.get("currentRoom"),function(err,res){
					if(res){
						console.log(">> addSongToPlaylist success");
					}
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
				return map[item].name + ' - <span>'+map[item].artist+'</span>' + '<small class="pull-right" style="color:#ddd">'+map[item].domain+'</small>';		
			else 
				return map[item].name + '<small class="pull-right" style="color:#ddd">'+map[item].domain+'</small>';			
		}
	});

}
