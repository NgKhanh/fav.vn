Meteor.headly.config({tagsForRequest: function(req) {
	var url = Npm.require('url'); 
	
	var parts = url.parse(req.url).pathname.split('/');
	
	console.log("###############################");
	console.log("facebook request url",parts[0],parts );
	console.log("###############################");
	
	var meta='';
		meta += '<meta property="og:site_name" content="FAVorite music" />';
		meta += '<meta property="og:type" content="music" />';
		
	if(parts.length>1){
		// re turn custome
		switch(parts[1]){
			case "a" :
				var _albumID = parts[2].substring( parts[2].lastIndexOf(".")+1,parts[2].length);
				var _album = Album.findOne({_id:_albumID});
				
				console.log("--- get albumID",_albumID,_album.genre,_album.title,);
				
				meta += '<meta property="og:url" 		content="http://fav.vn/a/'+parts[2]+'" />';
				meta += '<meta property="og:image" 		content="http://fav.vn'+getCoverAlbum(_album.genre)+'"/>';
				meta += '<meta property="og:title" 		content="Album: '+_album.title+' - tạo bởi '+_album.owner.name+'"/>';
				meta += '<meta property="og:description" content="Nghe nhạc và chia sẻ cảm xúc cùng '+_album.owner.name+'" />';
			break;			
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

