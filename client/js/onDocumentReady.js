loadTopAlbumList =function(){	
	Meteor.subscribe(	'Album', loadStep,
						function () {
							onDocumentReady();
							appendAlbumList();
							Backbone.history.start({pushState: true});
						});
}

getMyAlbum = function(){
	Meteor.subscribe(	'myAlbum',Meteor.user().username,
						function () {
							
							console.log("subscribe My Album");
							
							$("#myAlbumList").html("");
							
							var myAlbumTemp = Meteor.renderList(
								Album.find({"owner.username":Meteor.user().username},{sort:{createTime:-1}}),			
								function(album) {	
									if(album.title)	album.alias  	= "a/"+title2Alias(album.title) +"."+album._id;
										album.timeAgo 	= timeAgo(album.createTime);	
										album.length    = album.numSong;
									return Template["albumItem"](album);
							});	
							
							$("#myAlbumList").append(myAlbumTemp);	
						});
						
	// hiện label
	$("#myPlLabel").css("display","block");
}

onDocumentReady = function (templatePage) {  
	currentPath = window.location.pathname;
	initTypeAHead();
	
	
	$("#page2").css("height",$("#PageContainer").height());
	$("#page1").css("height",$("#PageContainer").height());	
	
	$('#albumList').slimScroll({
		width: '540px',		
		height: '495px'
	});
	
	$("#page2 .header").click( function(){
		Router.navigate('',{trigger: true}); 
	});
		
	// show PageContainer
	$("#MainContainer").transition({opacity:1});
	
	console.log("ON READY");
}

returnHome = function(){
	$("#page2").transition({y:$("#page1").height()});
	$("#page1").transition({y:0});
	$("#Nav").transition({x:0});
	
	// update message SYS > usser join room
	var _sysMsg = '';
	if(Meteor.userId())	_sysMsg = Meteor.user().profile.name + ' ra khỏi phòng';
	else 				_sysMsg = 'Có một khách không biết tên vừa ra khỏi phòng';			
	Meteor.call("sysMsg", _sysMsg , Session.get("currentRoom"), Session.get("currentSong"), function(err, res){
		// complete
	});
		
}

appendAlbumList =function(){	
	
	if(Meteor.user()){
		var templatePost = Meteor.renderList(
			Album.find({'owner.username':{ $ne: Meteor.user().username }},{	sort:{createTime:-1}}),			
			function(album) {	
				if(album.title)	album.alias  	= "a/"+title2Alias(album.title) +"."+album._id;
								album.timeAgo 	= timeAgo(album.createTime);	
								album.length    = album.numSong;
			return Template["albumItem"](album);	   
			    
		});	
		getMyAlbum();
	}else{
		var templatePost = Meteor.renderList(
			Album.find({},{	sort:{createTime:-1}}),			
			function(album) {	
				if(album.title)	album.alias  	= "a/"+title2Alias(album.title) +"."+album._id;
								album.timeAgo 	= timeAgo(album.createTime);	
								album.length    = album.numSong;
			return Template["albumItem"](album);	   
			    
		});	
	}
	
	$("#realTimeAlbumList").append(templatePost);	
}

gotoAlbum = function(_albumID){
	// check song is subscribe	
	if(Song.find({albumID:_albumID}).count()>0 ||  Message.find({roomID:_albumID}).count()>0){
		getAllRoomData(_albumID);
	}else{		
		Meteor.subscribe('MessageAndSong', _albumID, function () {
			getAllRoomData(_albumID);
		})
	}
}

getAllRoomData=function(_albumID){
	
	joinTime    = Date.now();
	
	console.log(" ->>> joint room",_albumID);	
		
	if(_albumID!=Session.get('currentRoom')){
		
		var _album =  Album.findOne({_id: _albumID});
			_album.alias   = AbsoluteUrl() + "a/"+title2Alias(_album.title) +"."+_album._id;    
			_album.timeAgo = timeAgo(_album.createTime);
		
		// admin room ?		
		if(Meteor.userId() && Meteor.user().profile.username==_album.owner.username)
			Session.set("isAdmin",true);
		else 
			Session.set("isAdmin",false);
		
		
		// vao phong chat khac;		
		// xoa het noi dung trong phong chat
		$('#chatlist #realtimeChat li').remove();		
		// current Room
		Session.set('currentRoom',_albumID);
		
		// update message SYS > usser join room
		var _sysMsg = '';
		if(Meteor.userId())	_sysMsg = Meteor.user().profile.name + ' vừa mới vào';
		else 				_sysMsg = 'Có một khách không biết tên vừa mới vào';			
		Meteor.call("sysMsg", _sysMsg , Session.get("currentRoom"), Session.get("currentSong"), function(err, res){
			// complete
		});
	}	
	
			
	// show Room				
	$("#page2").transition({y:-$("#page1").height()});
	$("#page1").transition({y:-$("#page1").height()});
	$("#Nav").transition({x:-$("#Nav").width()});
	
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
		 
		},
		
		updater:function (item) {
			console.log("select item >>",item,map[item]);
			
			var _song={};						
				_song.title 	= map[item].name;
				_song.artist 	= map[item].artist;
				_song.domain 	= map[item].domain;
				_song.source  	= map[item].source;
			
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
			return map[item].name + ' - <span>'+map[item].artist+'</span>' + '<small class="pull-right" style="color:#ddd">'+map[item].domain+'</small>';			
		}
	});

}

nextSong = function(){	
	var next = parseInt($("#albumPlaylist").find("#"+Session.get("currentSong")).attr("index")) + 1;	
	if(next==listSongInMyListeningAlbum.length)	
		next = 0;	
	
	var song = listSongInMyListeningAlbum[next];	
	
	console.log(" ---> end song >> next", next);
	
	Session.set("currentSong", song._id);
	Session.set('currentSongSource', song.source);
	activePlaylistItem();
}

activePlaylistItem=function(){
	var scroll =  $("#albumPlaylist").find("li").each(function(index){
   			if($(this).attr("id") == Session.get("currentSong")){
   				$(this).addClass("active");
   			}else{
   				$(this).removeClass("active");
   			}
	});
}

parseMp3Source = function(_id, _domain){
	var arr=[	"http://mp3.zing.vn/html5/song/LncHTLnaBNRzSVCytbmLn"
				,"http://mp3.zing.vn/html5/song/ZGcnyLnNBiSQCEJttvHkn"
				,"http://mp3.zing.vn/html5/song/ZncHyLHNdNhgslxTTbGZn"
				,"http://mp3.zing.vn/html5/song/LHxmyLmNdsADHCWytDGkG"
				,"http://mp3.zing.vn/html5/song/LmJGykmsVsAaEBpyyvHZn"
				,"http://s82.stream.nixcdn.com/9c0a2d958a136f7645aabb6d8c48b733/51c98b4c/NhacCuaTui829/BienCan-LeQuyenUyenLinh-2454494.mp3"
	]
	var ran = parseInt(Math.random()*arr.length);
	return arr[ran];
}

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

