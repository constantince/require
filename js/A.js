asdf.define(function(){
	var a = this.require('js/B');
	// console.log(a, document.currentScript.src);
	return { A: a };
});