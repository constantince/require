// asdf.define('main', function(){
// 	var a = asdf.require('js/A');
// 	console.log(a);
// });


Salut.require('js/A', function(a){
	//console.log(a);
});

document.addEventListener('click', function(){
	// asdf.require('js/D', function(d){
	// 	console.log(d);
	// 	console.log(this);
	// });
	Salut.require('js/E', function(e){
		console.log(e);
	})
});