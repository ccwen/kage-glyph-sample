scaffold for ksana2015 app
====

install github.com/ksanaforge/ksana2015

ks mkdb sample

react-bundle.js is created with 

    browserify -r react -r react/addons > react-bundle.js

git clone ... /kage-glyph-sample

檢視 http://rawgit.com/ksanaforge/kage-glyph-sample/master ????

or

ks server 
啟動 kage-glyph-sample local host server
檢視 http://127.0.0.1:2556/kage-glyph-sample chrome web page 互動網頁
(執行 kage-glyph-sample/src/main.jsx 中 render function)
maincomponent.state.toload:"子口李杏"
產生 input box (ref:"toload",value:"子口李杏")
每個字 組字資訊
maincomponent.state.components:["子","口","李","木3","子4","杏","口4"]
產生 input boxs ("子","口","李","杏")
針對 複合字 ("李","杏")
產生 "李" 組成部件 ("木3","子4")
產生 "杏" 組成部件 ("口4")

glyphwiki.org/wiki/u674e?action=edit 參閱 李 的組字資訊

   mocha -w test/test.js