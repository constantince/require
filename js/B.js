asdf.define('B', function(){
	var b = this.require('js/C');
	// console.log(document.currentScript.src);
	return { B: b };
});