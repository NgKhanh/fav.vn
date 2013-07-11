var MyRouter = Backbone.Router.extend({

  routes: {    "*path" :"parseURL" },

  parseURL:function(){   
    
    var _url=$.url(true);

    switch(_url.segment(1)){
      case "":
      case "undefined":
      case undefined:       
        // trở về trang chính
		returnHome();
      break;

	case "a":
		// đến trang album
        if(_url.segment(2)){			  
            var _albumID = _url.segment(2).substring(_url.segment(2).lastIndexOf(".")+1,_url.segment(2).length);            
            gotoAlbum(_albumID);
        }  
      break;
    }

  }
  
});

Router = new MyRouter;
