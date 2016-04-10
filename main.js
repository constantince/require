// asdf.define('main', function(){
// 	var a = asdf.require('js/A');
// 	console.log(a);
// });


asdf.require('js/A', function(a){
	console.log(a);
});

document.addEventListener('click', function(){
	asdf.require('js/C', function(d){
		console.log(d);
		console.log(this);
	});
});