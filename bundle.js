(()=>{"use strict";var e={56:(e,t,n)=>{e.exports=function(e){var t=n.nc;t&&e.setAttribute("nonce",t)}},72:e=>{var t=[];function n(e){for(var n=-1,o=0;o<t.length;o++)if(t[o].identifier===e){n=o;break}return n}function o(e,o){for(var a={},i=[],r=0;r<e.length;r++){var c=e[r],l=o.base?c[0]+o.base:c[0],d=a[l]||0,h="".concat(l," ").concat(d);a[l]=d+1;var p=n(h),m={css:c[1],media:c[2],sourceMap:c[3],supports:c[4],layer:c[5]};if(-1!==p)t[p].references++,t[p].updater(m);else{var u=s(m,o);o.byIndex=r,t.splice(r,0,{identifier:h,updater:u,references:1})}i.push(h)}return i}function s(e,t){var n=t.domAPI(t);return n.update(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap&&t.supports===e.supports&&t.layer===e.layer)return;n.update(e=t)}else n.remove()}}e.exports=function(e,s){var a=o(e=e||[],s=s||{});return function(e){e=e||[];for(var i=0;i<a.length;i++){var r=n(a[i]);t[r].references--}for(var c=o(e,s),l=0;l<a.length;l++){var d=n(a[l]);0===t[d].references&&(t[d].updater(),t.splice(d,1))}a=c}}},113:e=>{e.exports=function(e,t){if(t.styleSheet)t.styleSheet.cssText=e;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(e))}}},314:e=>{e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n="",o=void 0!==t[5];return t[4]&&(n+="@supports (".concat(t[4],") {")),t[2]&&(n+="@media ".concat(t[2]," {")),o&&(n+="@layer".concat(t[5].length>0?" ".concat(t[5]):""," {")),n+=e(t),o&&(n+="}"),t[2]&&(n+="}"),t[4]&&(n+="}"),n})).join("")},t.i=function(e,n,o,s,a){"string"==typeof e&&(e=[[null,e,void 0]]);var i={};if(o)for(var r=0;r<this.length;r++){var c=this[r][0];null!=c&&(i[c]=!0)}for(var l=0;l<e.length;l++){var d=[].concat(e[l]);o&&i[d[0]]||(void 0!==a&&(void 0===d[5]||(d[1]="@layer".concat(d[5].length>0?" ".concat(d[5]):""," {").concat(d[1],"}")),d[5]=a),n&&(d[2]?(d[1]="@media ".concat(d[2]," {").concat(d[1],"}"),d[2]=n):d[2]=n),s&&(d[4]?(d[1]="@supports (".concat(d[4],") {").concat(d[1],"}"),d[4]=s):d[4]="".concat(s)),t.push(d))}},t}},540:e=>{e.exports=function(e){var t=document.createElement("style");return e.setAttributes(t,e.attributes),e.insert(t,e.options),t}},552:(e,t,n)=>{n.d(t,{A:()=>r});var o=n(601),s=n.n(o),a=n(314),i=n.n(a)()(s());i.push([e.id,'* {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n}\n\nbody {\n    font-family: Arial, sans-serif;\n    line-height: 1.6;\n    background-color: #f4f4f4;\n    color: #333;\n    padding: 20px;\n    font-size: 18px;\n}\n\n.container {\n    max-width: 1000px;\n    margin: 0 auto;\n    padding: 30px;\n    background-color: white;\n    border-radius: 10px;\n    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);\n}\n\nh1 {\n    text-align: center;\n    margin-bottom: 30px;\n    color: #2c3e50;\n    font-size: 36px;\n}\n\n#game-container {\n    margin-bottom: 30px;\n}\n\n#sheet-music {\n    height: 300px;\n    background-color: #f9f9f9;\n    border: 1px solid #ddd;\n    margin-bottom: 30px;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n\n#note-options {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    gap: 20px;\n    margin-bottom: 50px;\n    min-height: 300px;\n    position: relative;\n    padding-bottom: 30px;\n}\n\n.note-button {\n    padding: 15px 30px;\n    background-color: #3498db;\n    color: white;\n    border: none;\n    border-radius: 8px;\n    cursor: pointer;\n    font-size: 22px;\n    transition: background-color 0.3s;\n}\n\n.note-button:hover {\n    background-color: #2980b9;\n}\n\n/* Piano Keyboard Styles */\n.toggle-buttons {\n    display: flex;\n    justify-content: center;\n    gap: 10px;\n    margin-bottom: 15px;\n}\n\n.toggle-button {\n    padding: 8px 15px;\n    background-color: #2c3e50;\n    color: white;\n    border: none;\n    border-radius: 5px;\n    cursor: pointer;\n    font-size: 16px;\n}\n\n.toggle-button:hover {\n    background-color: #1a2530;\n}\n\n.piano-keyboard {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    border: 1px solid #ccc;\n    border-radius: 5px;\n    padding: 20px 10px 25px;\n    background-color: #e0e0e0;\n    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);\n    width: 100%;\n    margin-bottom: 20px;\n    position: relative;\n}\n\n/* Styles for dual keyboards */\n.keyboards-container {\n    display: flex;\n    flex-direction: column;\n    width: 100%;\n    gap: 20px;\n}\n\n.keyboard-label {\n    font-size: 18px;\n    font-weight: bold;\n    margin-bottom: 10px;\n    color: #2c3e50;\n    text-align: center;\n}\n\n.piano-keyboard[data-clef="treble"] {\n    background-color: #e1f5fe; /* Light blue for treble clef */\n}\n\n.piano-keyboard[data-clef="bass"] {\n    background-color: #d4e6f1; /* Slightly different blue for bass clef */\n}\n\n.keyboard-keys {\n    display: flex;\n    flex-direction: row;\n    justify-content: center;\n    width: 100%;\n    overflow-x: auto;\n    position: relative;\n    min-height: 250px;\n    padding-bottom: 15px;\n    margin-bottom: 0;\n}\n\n.octave {\n    display: flex;\n    position: relative;\n    height: 225px;\n}\n\n.third-octave {\n    width: auto;\n}\n\n.piano-key {\n    position: relative;\n    cursor: pointer;\n    display: flex;\n    justify-content: center;\n    align-items: flex-end;\n    padding-bottom: 15px;\n    transition: all 0.2s;\n}\n\n.white-key {\n    width: 60px;\n    height: 225px;\n    background-color: white;\n    border: 1px solid #999;\n    z-index: 1;\n}\n\n.black-key {\n    width: 36px;\n    height: 135px;\n    background-color: black;\n    border: 1px solid #666;\n    z-index: 2;\n    position: absolute;\n    top: 0;\n    color: white;\n    padding-bottom: 7px;\n}\n\n.piano-key.selectable {\n    cursor: pointer;\n}\n\n.white-key.selectable:hover {\n    background-color: #e3f2fd;\n}\n\n.black-key.selectable:hover {\n    background-color: #333;\n}\n\n.piano-key.disabled {\n    opacity: 0.5;\n    cursor: default;\n}\n\n.piano-key.unavailable {\n    opacity: 0.8;\n    cursor: pointer;\n}\n\n.piano-key.unavailable:hover {\n    background-color: #f5f5f5; /* Light gray for white keys */\n}\n\n.black-key.unavailable:hover {\n    background-color: #444; /* Dark gray for black keys */\n}\n\n.note-name {\n    font-size: 18px;\n    font-weight: bold;\n}\n\n.white-key .note-name {\n    color: #333;\n}\n\n.black-key .note-name {\n    color: white;\n}\n\n/* Middle C indicator */\n.piano-key.middle-c::after {\n    content: "Middle C";\n    position: absolute;\n    bottom: -25px;\n    left: 50%;\n    transform: translateX(-50%);\n    font-size: 12px;\n    color: #e74c3c;\n    font-weight: bold;\n    white-space: nowrap;\n    width: 100%;\n    text-align: center;\n    pointer-events: none;\n    z-index: 10;\n}\n\n.piano-key.middle-c {\n    border-bottom: 4px solid #e74c3c;\n}\n\n#feedback {\n    text-align: center;\n    height: 32px;\n    margin-bottom: 20px;\n    font-weight: bold;\n    font-size: 24px;\n}\n\n.correct {\n    color: green;\n}\n\n.incorrect {\n    color: red;\n}\n\n#game-stats {\n    font-size: 22px;\n    margin-bottom: 30px;\n}\n\n#score {\n    text-align: center;\n    font-size: 24px;\n    margin-bottom: 30px;\n}\n\n#controls {\n    display: flex;\n    justify-content: center;\n    gap: 15px;\n}\n\nbutton {\n    padding: 15px 30px;\n    background-color: #2c3e50;\n    color: white;\n    border: none;\n    border-radius: 8px;\n    cursor: pointer;\n    font-size: 22px;\n    transition: background-color 0.3s;\n}\n\nbutton:hover {\n    background-color: #1a2530;\n}\n\n/* Stats Popup Styles */\n.popup {\n    display: none;\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background-color: rgba(0, 0, 0, 0.7);\n    z-index: 1000;\n    overflow: auto;\n}\n\n.popup-content {\n    position: relative;\n    background-color: white;\n    width: 80%;\n    max-width: 800px;\n    margin: 50px auto;\n    padding: 30px;\n    border-radius: 10px;\n    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);\n    max-height: 80vh;\n    overflow-y: auto;\n}\n\n.close-button {\n    position: absolute;\n    top: 15px;\n    right: 20px;\n    font-size: 30px;\n    font-weight: bold;\n    color: #666;\n    cursor: pointer;\n    transition: color 0.3s;\n}\n\n.close-button:hover {\n    color: #333;\n}\n\n.stats-section {\n    margin-bottom: 30px;\n}\n\n.stats-section h3 {\n    margin-bottom: 15px;\n    color: #2c3e50;\n    border-bottom: 1px solid #eee;\n    padding-bottom: 8px;\n}\n\n.stats-list {\n    font-size: 16px;\n    line-height: 1.6;\n}\n\n.note-group {\n    margin: 10px 0;\n    padding: 10px;\n    background-color: #f9f9f9;\n    border-radius: 5px;\n    border-left: 4px solid #3498db;\n}\n\n.level-item {\n    margin: 15px 0;\n    padding: 15px;\n    background-color: #f9f9f9;\n    border-radius: 5px;\n    border-left: 4px solid #2c3e50;\n}\n\n.level-title {\n    font-weight: bold;\n    font-size: 18px;\n    margin-bottom: 8px;\n    color: #2c3e50;\n}\n\n.level-description {\n    color: #666;\n    margin-bottom: 10px;\n}\n\n.level-notes {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 8px;\n}\n\n.note-tag {\n    display: inline-block;\n    padding: 4px 8px;\n    background-color: #3498db;\n    color: white;\n    border-radius: 4px;\n    font-size: 14px;\n}\n\n.note-tag.new {\n    background-color: #e74c3c;\n}\n\n/* Level selection styles */\n.level-selection {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 10px;\n    margin-bottom: 15px;\n}\n\n.level-button {\n    padding: 8px 15px;\n    background-color: #3498db;\n    color: white;\n    border: none;\n    border-radius: 5px;\n    cursor: pointer;\n    font-size: 16px;\n    transition: background-color 0.3s;\n}\n\n.level-button:hover {\n    background-color: #2980b9;\n}\n\n.level-button.current {\n    background-color: #e74c3c;\n}\n\n.settings-controls {\n    display: flex;\n    flex-direction: column;\n    gap: 15px;\n}\n\n/* Cartoon character popup */\n.cartoon-character-popup {\n    position: fixed;\n    top: 20px;\n    right: 20px;\n    transform: scale(0.9);\n    background-color: white;\n    padding: 15px;\n    border-radius: 15px;\n    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);\n    z-index: 1000;\n    text-align: left;\n    opacity: 0;\n    transition: all 0.3s ease;\n    max-width: 320px;\n    border: 4px solid #3498db;\n    pointer-events: none;\n    display: flex;\n    align-items: center;\n}\n\n.cartoon-character-popup.visible {\n    opacity: 1;\n    transform: scale(1);\n}\n\n.cartoon-character-popup .character-avatar {\n    width: 70px;\n    height: 70px;\n    margin-right: 15px;\n    flex-shrink: 0;\n}\n\n.cartoon-character-popup .character-avatar img {\n    width: 100%;\n    height: 100%;\n    object-fit: contain;\n    border: 2px solid #3498db;\n}\n\n.cartoon-character-popup .character-content {\n    flex: 1;\n}\n\n.cartoon-character-popup h3 {\n    font-size: 18px;\n    margin-bottom: 8px;\n    color: #2c3e50;\n}\n\n.cartoon-character-popup p {\n    font-size: 16px;\n    color: #34495e;\n    font-weight: bold;\n    margin: 0;\n}\n\n/* Show the popup when it has the \'active\' class */\n.popup.active {\n    display: block;\n} ',""]);const r=i},601:e=>{e.exports=function(e){return e[1]}},659:e=>{var t={};e.exports=function(e,n){var o=function(e){if(void 0===t[e]){var n=document.querySelector(e);if(window.HTMLIFrameElement&&n instanceof window.HTMLIFrameElement)try{n=n.contentDocument.head}catch(e){n=null}t[e]=n}return t[e]}(e);if(!o)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");o.appendChild(n)}},825:e=>{e.exports=function(e){if("undefined"==typeof document)return{update:function(){},remove:function(){}};var t=e.insertStyleElement(e);return{update:function(n){!function(e,t,n){var o="";n.supports&&(o+="@supports (".concat(n.supports,") {")),n.media&&(o+="@media ".concat(n.media," {"));var s=void 0!==n.layer;s&&(o+="@layer".concat(n.layer.length>0?" ".concat(n.layer):""," {")),o+=n.css,s&&(o+="}"),n.media&&(o+="}"),n.supports&&(o+="}");var a=n.sourceMap;a&&"undefined"!=typeof btoa&&(o+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(a))))," */")),t.styleTagTransform(o,e,t.options)}(t,e,n)},remove:function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(t)}}}}},t={};function n(o){var s=t[o];if(void 0!==s)return s.exports;var a=t[o]={id:o,exports:{}};return e[o](a,a.exports,n),a.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.nc=void 0;const o=[{name:"F",position:1,isSpace:!0,clef:"treble",octave:4},{name:"A",position:2,isSpace:!0,clef:"treble",octave:4},{name:"C",position:3,isSpace:!0,clef:"treble",octave:5},{name:"E",position:4,isSpace:!0,clef:"treble",octave:5},{name:"E",position:1,isSpace:!1,clef:"treble",octave:4},{name:"G",position:2,isSpace:!1,clef:"treble",octave:4},{name:"B",position:3,isSpace:!1,clef:"treble",octave:4},{name:"D",position:4,isSpace:!1,clef:"treble",octave:5},{name:"F",position:5,isSpace:!1,clef:"treble",octave:5}],s=[{name:"A",position:1,isSpace:!0,clef:"bass",octave:2},{name:"C",position:2,isSpace:!0,clef:"bass",octave:3},{name:"E",position:3,isSpace:!0,clef:"bass",octave:3},{name:"G",position:4,isSpace:!0,clef:"bass",octave:3},{name:"G",position:1,isSpace:!1,clef:"bass",octave:2},{name:"B",position:2,isSpace:!1,clef:"bass",octave:2},{name:"D",position:3,isSpace:!1,clef:"bass",octave:3},{name:"F",position:4,isSpace:!1,clef:"bass",octave:3},{name:"A",position:5,isSpace:!1,clef:"bass",octave:3}],a=o.filter((e=>e.isSpace&&"treble"===e.clef)),i=[...o.filter((e=>!e.isSpace)),...s.filter((e=>e.isSpace)),...s.filter((e=>!e.isSpace))],r={requiredSuccessCount:10,maxTimePerProblem:5};class c{static generateLevels(){const e=[];e.push({id:1,name:"Treble Clef Spaces",description:"Learn the notes in the spaces of the treble clef (F, A, C, E)",clef:"treble",notes:a,...r});let t=[...a];for(let n=0;n<i.length;n++){const o=i[n],s=(n>0?i[n-1].clef:"treble")!==o.clef;e.push({id:n+2,name:s?`Introduction to ${o.clef.charAt(0).toUpperCase()+o.clef.slice(1)} Clef: ${o.name}`:`Learning ${o.name}`,description:`Learn the note ${o.name} on the ${o.clef} clef`,clef:o.clef,notes:[...t,o],newNote:o,learnedNotes:t,...r}),t=[...t,o]}return e.push({id:i.length+2,name:"Master Level",description:"Practice all notes on both the treble and bass clefs",clef:"treble",notes:[...o,...s],...r,requiredSuccessCount:15,maxTimePerProblem:4}),e}static get levels(){return this.generateLevels()}}c.NEW_NOTE_FREQUENCY=.2,c.LEVEL_CRITERIA=r;class l{constructor(e){this.currentNoteIndex=0,this.notePool=[],this.config=e,this.notes=[...e.notes],this.initializeNotePool()}getCurrentNote(){return this.notePool[this.currentNoteIndex]}getAvailableNotes(){return this.notes}nextNote(){const e=this.getCurrentNote();let t=(this.currentNoteIndex+1)%this.notePool.length;if(this.notePool.length>1)for(;this.isSameNote(e,this.notePool[t]);)t=(t+1)%this.notePool.length;this.currentNoteIndex=t}isSameNote(e,t){return e.name===t.name&&e.octave===t.octave&&e.accidental===t.accidental}isComplete(e){const t=this.config.requiredSuccessCount,n=this.config.maxTimePerProblem;if(e.length<t)return!1;const o=e.slice(-t),s=o.every((e=>e.isCorrect)),a=o.reduce(((e,t)=>e+t.timeSpent),0)/o.length;return s&&a<n}initializeNotePool(){if(this.notePool=[],this.config.newNote&&this.config.learnedNotes){const e=this.config.newNote,t=this.config.learnedNotes,n=100,o=Math.round(n*c.NEW_NOTE_FREQUENCY),s=n-o;for(let t=0;t<o;t++)this.notePool.push(e);if(t.length>0){const e=Math.floor(s/t.length);for(const n of t)for(let t=0;t<e;t++)this.notePool.push(n);const n=s-e*t.length;for(let e=0;e<n;e++)this.notePool.push(t[e%t.length])}}else this.notePool=[...this.notes];this.shuffleNotePool()}updateNotePool(e){const t=this.getCurrentNote();this.initializeNotePool();const n=[];for(const t of this.notes){const o=e[t.name];if(o&&o.incorrect>0){const e=o.incorrect/(o.correct+o.incorrect),s=Math.min(5,Math.ceil(10*e));for(let e=0;e<s;e++)n.push(t)}}this.notePool=[...this.notePool,...n],this.shuffleNotePool();const o=this.notePool.findIndex((e=>e.name===t.name&&e.clef===t.clef&&e.position===t.position));this.currentNoteIndex=o>=0?o:0}shuffleNotePool(){for(let e=this.notePool.length-1;e>0;e--){const t=Math.floor(Math.random()*(e+1));[this.notePool[e],this.notePool[t]]=[this.notePool[t],this.notePool[e]]}}}class d{constructor(e){this.width=700,this.height=300,this.lineSpacing=15,this.staffY=150,this.imagesLoaded=!1;const t=document.getElementById(e);if(!t)throw new Error(`Container element with id '${e}' not found`);this.container=t,this.canvas=document.createElement("canvas"),this.canvas.width=this.width,this.canvas.height=this.height;const n=this.canvas.getContext("2d");if(!n)throw new Error("Failed to get canvas context");this.ctx=n,this.container.appendChild(this.canvas),this.trebleClefImg=new Image,this.bassClefImg=new Image,this.trebleClefImg.onerror=e=>{console.error("Failed to load treble clef image:",e)},this.bassClefImg.onerror=e=>{console.error("Failed to load bass clef image:",e)};let o=0;const s=()=>{o++,console.log("Image loaded successfully:",o),2===o&&(this.imagesLoaded=!0,this.drawStaff(),console.log("Clef images loaded and staff drawn"))};this.trebleClefImg.onload=s,this.bassClefImg.onload=s;const a=["./imgs/treble_clef.png","../imgs/treble_clef.png","../../imgs/treble_clef.png","imgs/treble_clef.png","/imgs/treble_clef.png"];this.loadTrebleClefFromPaths(a,0);const i=a.map((e=>e.replace("treble","bass")));this.loadBassClefFromPaths(i,0),this.drawStaff()}loadTrebleClefFromPaths(e,t){t>=e.length?console.error("Failed to load treble clef from any path"):(console.log("Trying to load treble clef from:",e[t]),this.trebleClefImg.src=e[t],setTimeout((()=>{this.imagesLoaded||this.loadTrebleClefFromPaths(e,t+1)}),500))}loadBassClefFromPaths(e,t){t>=e.length?console.error("Failed to load bass clef from any path"):(console.log("Trying to load bass clef from:",e[t]),this.bassClefImg.src=e[t],setTimeout((()=>{this.imagesLoaded||this.loadBassClefFromPaths(e,t+1)}),500))}renderNote(e){this.clear(),this.drawStaff(),this.drawClef(e.clef),this.drawNote(e),void 0!==e.octave&&(this.ctx.fillStyle="#666666",this.ctx.font="14px Arial",this.ctx.fillText(`Octave: ${e.octave}`,this.width-100,30)),console.log(`Rendering ${e.name}${e.octave||""} note on ${e.clef} clef`)}clear(){this.ctx.clearRect(0,0,this.width,this.height)}drawStaff(){this.ctx.strokeStyle="black",this.ctx.lineWidth=2;for(let e=0;e<5;e++){const t=this.staffY+(e-2)*this.lineSpacing*2;this.ctx.beginPath(),this.ctx.moveTo(70,t),this.ctx.lineTo(this.width-70,t),this.ctx.stroke()}}drawClef(e){this.imagesLoaded?"treble"===e?this.ctx.drawImage(this.trebleClefImg,80,this.staffY-65,50,130):this.ctx.drawImage(this.bassClefImg,80,this.staffY-45,50,90):console.log("Clef images not yet loaded")}drawNote(e){let t;e.clef,t=e.isSpace?this.staffY+(2-e.position)*this.lineSpacing*2+this.lineSpacing:this.staffY+(2-e.position+1)*this.lineSpacing*2;const n=this.width/2;if(this.ctx.fillStyle="black",this.ctx.beginPath(),this.ctx.ellipse(n,t,11.5,11.5,0,0,2*Math.PI),this.ctx.fill(),this.ctx.lineWidth=2,this.ctx.beginPath(),this.ctx.moveTo(n+11,t),this.ctx.lineTo(n+11,t-50),this.ctx.stroke(),e.accidental){this.ctx.fillStyle="black",this.ctx.font="28px Arial";let o="";switch(e.accidental){case"sharp":o="♯";break;case"flat":o="♭";break;case"natural":o="♮"}this.ctx.fillText(o,n-35,t+7)}}}class h{constructor(e){this.storageKey=e}saveState(e){try{const t=JSON.stringify(e);localStorage.setItem(this.storageKey,t)}catch(e){console.error("Failed to save game state:",e)}}loadState(){try{const e=localStorage.getItem(this.storageKey);if(null===e)return null;const t=JSON.parse(e);return this.isValidGameState(t)?t:(console.warn("Invalid game state found in storage, clearing..."),this.clearState(),null)}catch(e){return console.error("Failed to load game state, clearing corrupt data:",e),this.clearState(),null}}isValidGameState(e){return!(!e||"object"!=typeof e||"number"!=typeof e.currentLevelIndex||"boolean"!=typeof e.isGameRunning||!e.noteHistory||"object"!=typeof e.noteHistory||(e.recentAttempts||(e.recentAttempts=[]),Array.isArray(e.recentAttempts)||(e.recentAttempts=[]),0))}clearState(){try{localStorage.removeItem(this.storageKey)}catch(e){console.error("Failed to clear game state:",e)}}}const p={treble:{C6:{position:8,isSpace:!1},B5:{position:7,isSpace:!0},A5:{position:7,isSpace:!1},G5:{position:6,isSpace:!0},F5:{position:5,isSpace:!1},E5:{position:4,isSpace:!0},D5:{position:4,isSpace:!1},C5:{position:3,isSpace:!0},B4:{position:3,isSpace:!1},A4:{position:2,isSpace:!0},G4:{position:2,isSpace:!1},F4:{position:1,isSpace:!0},E4:{position:1,isSpace:!1},D4:{position:0,isSpace:!0},C4:{position:0,isSpace:!1}},bass:{B3:{position:6,isSpace:!0},A3:{position:5,isSpace:!1},G3:{position:4,isSpace:!0},F3:{position:4,isSpace:!1},E3:{position:3,isSpace:!0},D3:{position:3,isSpace:!1},C3:{position:2,isSpace:!0},B2:{position:2,isSpace:!1},A2:{position:1,isSpace:!0},G2:{position:1,isSpace:!1},F2:{position:0,isSpace:!0},E2:{position:0,isSpace:!1},D2:{position:-1,isSpace:!0},C2:{position:-1,isSpace:!1}}};class m{static getInstance(){return m.instance||(m.instance=new m),m.instance}constructor(){this.notes=new Map,this.initializeNotes()}initializeNotes(){const e=["C","D","E","F","G","A","B"];for(let t=2;t<=6;t++)for(const n of e){if(6===t&&"C"!==n)continue;const e=t<4?"bass":"treble",o=p[e][`${n}${t}`];if(!o)continue;const s={name:n,position:o.position,isSpace:o.isSpace,octave:t,clef:e};if(this.notes.set(this.getNoteKey(n,void 0,t),s),"E"!==n&&"B"!==n){const s={name:n,position:o.position,isSpace:o.isSpace,octave:t,clef:e,accidental:"sharp"};this.notes.set(this.getNoteKey(n,"sharp",t),s)}}}getNoteKey(e,t,n){return`${e}${t||""}${n}`}getNote(e,t,n){return this.notes.get(this.getNoteKey(e,t,n))}getAllNotes(){return Array.from(this.notes.values())}getNotesByClef(e){return Array.from(this.notes.values()).filter((t=>t.clef===e))}getNotesInRange(e,t){return Array.from(this.notes.values()).filter((n=>n.octave>=e&&n.octave<=t))}}class u{constructor(e){this.showNoteNames=!0,this.showAllKeys=!1,this.currentClef="treble",this.whiteKeys=["C","D","E","F","G","A","B"],this.blackKeys=["C#","D#","F#","G#","A#"],this.trebleClefStartOctave=4,this.bassClefStartOctave=2,this.middleC=4;const t=document.getElementById(e);if(!t)throw new Error(`Container element with id '${e}' not found`);this.container=t,this.noteRepository=m.getInstance()}setCurrentClef(e){this.currentClef=e}renderKeyboard(e,t,n){this.container.innerHTML="",n&&(this.currentClef=n);const o=document.createElement("div");o.className="toggle-buttons";const s=document.createElement("button");s.className="toggle-button",s.textContent=this.showNoteNames?"Hide Note Names":"Show Note Names",s.addEventListener("click",(()=>{this.showNoteNames=!this.showNoteNames,s.textContent=this.showNoteNames?"Hide Note Names":"Show Note Names",this.renderKeyboard(e,t)}));const a=document.createElement("button");a.className="toggle-button",a.textContent=this.showAllKeys?"Hide Unavailable Notes":"Show All Notes",a.addEventListener("click",(()=>{this.showAllKeys=!this.showAllKeys,a.textContent=this.showAllKeys?"Hide Unavailable Notes":"Show All Notes",this.renderKeyboard(e,t)})),o.appendChild(s),o.appendChild(a),this.container.appendChild(o);const i=document.createElement("div");i.className="keyboards-container";const r="treble"===this.currentClef,c=r?"Treble Clef (C4-C6)":"Bass Clef (C2-C4)",l=r?this.trebleClefStartOctave:this.bassClefStartOctave,d=document.createElement("div");d.className="piano-keyboard",d.dataset.clef=this.currentClef;const h=document.createElement("div");h.className="keyboard-label",h.textContent=c,d.appendChild(h);const p=this.createKeyboardKeys(l,e,t);d.appendChild(p),i.appendChild(d),this.container.appendChild(i)}createKeyboardKeys(e,t,n){const o=document.createElement("div");o.className="keyboard-keys";const s=document.createElement("div");s.className="octave",this.createOctaveKeys(s,e,t,n),o.appendChild(s);const a=document.createElement("div");a.className="octave",this.createOctaveKeys(a,e+1,t,n),o.appendChild(a);const i=document.createElement("div");i.className="octave third-octave";const r=e+2;return this.createPianoKey(i,"C",r,t,n,"white-key"),o.appendChild(i),o}createOctaveKeys(e,t,n,o){for(const s of this.whiteKeys)this.createPianoKey(e,s,t,n,o,"white-key");for(const s of this.blackKeys){const a=s.charAt(0),i=this.createPianoKey(e,a,t,n,o,"black-key","sharp");switch(a){case"C":i.style.left="10%";break;case"D":i.style.left="24%";break;case"F":i.style.left="53%";break;case"G":i.style.left="67%";break;case"A":i.style.left="81%"}}}createPianoKey(e,t,n,o,s,a,i){const r=document.createElement("div");r.className=`piano-key ${a}`,"C"!==t||n!==this.middleC||i||r.classList.add("middle-c");const c=this.noteRepository.getNote(t,i,n);if(!c)return r;const l=this.findMatchingNote(c,o);if(this.showAllKeys||l?(r.classList.add("selectable"),r.addEventListener("click",(()=>s(c)))):r.classList.add("disabled"),this.showNoteNames&&"white-key"===a){const e=document.createElement("span");e.className="note-name",e.textContent=t,r.appendChild(e)}return e.appendChild(r),r}findMatchingNote(e,t){return t.find((t=>{const n=t.name.toLowerCase()===e.name.toLowerCase(),o=t.octave===e.octave,s=t.accidental===e.accidental||!t.accidental&&!e.accidental;return n&&o&&s}))}toggleNoteNames(){this.showNoteNames=!this.showNoteNames}toggleShowAllKeys(){this.showAllKeys=!this.showAllKeys}}const g=[{name:"Mickey Mouse",messages:["Hot dog! You're on a roll!","Oh boy! Keep up the great work!","Gosh, you're getting good at this!"],avatar:"./imgs/mickeymouse.jpg"},{name:"SpongeBob",messages:["I'm ready! You're ready! For more notes!","Sweet victory! Keep it up!","That's the spirit! You're doing great!"],avatar:"./imgs/spongebob.png"},{name:"Bugs Bunny",messages:["Eh, what's up, Doc? Nice streak you got there!","That's all folks... Just kidding, keep going!","You're doing swell, Doc!"],avatar:"./imgs/bugsbunny.jpg"},{name:"Pikachu",messages:["Pika Pika! You're electrifying!","Pikachu is impressed by your skills!","Pika Pi! You're on fire!"],avatar:"./imgs/pikachu.jpg"},{name:"Homer Simpson",messages:["Woo hoo! Four correct notes!","Mmm... musical notes...","D'oh! I mean... Bravo!"],avatar:"./imgs/homersimpson.jpg"}];class f{constructor(){this.currentLevel=null,this.noteDisplayTime=0,this.lastStreakAnimation=0,this.characterElement=null,this.state={currentLevelIndex:0,isGameRunning:!1,noteHistory:{},recentAttempts:[]},this.noteRepository=m.getInstance(),this.sheetRenderer=new d("sheet-music"),this.keyboardRenderer=new u("note-options"),this.storageManager=new h("music-reading-game"),this.noteOptionsContainer=document.getElementById("note-options"),this.feedbackElement=document.getElementById("feedback"),this.streakElement=document.getElementById("streak-value"),this.speedElement=document.getElementById("speed-value"),this.streakRequiredElement=document.getElementById("streak-required"),this.speedRequiredElement=document.getElementById("speed-required");const e=this.storageManager.loadState();e&&(console.log("Restored previous game state:",e),this.state=e),this.updateStats()}start(){this.state.isGameRunning||(this.state.isGameRunning=!0,this.loadLevel(this.state.currentLevelIndex),console.log("Game started!"),this.updateLevelRequirements())}setLevel(e){e<0||e>=c.levels.length?console.error(`Level ${e} does not exist.`):(this.state.currentLevelIndex=e,this.state.recentAttempts=[],this.storageManager.saveState(this.state),this.state.isGameRunning&&this.loadLevel(e))}isGameRunning(){return this.state.isGameRunning}reset(){console.log("Resetting game and clearing storage..."),this.storageManager.clearState(),this.state={currentLevelIndex:0,isGameRunning:!1,noteHistory:{},recentAttempts:[]},this.storageManager.saveState(this.state),this.updateStats(),this.clearFeedback(),this.clearNoteOptions(),this.sheetRenderer.clear(),console.log("Game reset complete.")}loadLevel(e){const t=c.levels;if(e<0||e>=t.length)return void console.error(`Level ${e} does not exist.`);const n=t[e];console.log(`Loading level ${e+1}: ${n.name}`),this.currentLevel=new l(n),n.newNote&&!this.state.noteHistory[n.newNote.name]&&(this.state.noteHistory[n.newNote.name]={correct:0,incorrect:0}),this.currentLevel&&this.currentLevel.updateNotePool(this.state.noteHistory),this.displayCurrentNote(),this.updateLevelRequirements()}displayCurrentNote(){if(!this.currentLevel)return;const e=this.currentLevel.getCurrentNote();this.sheetRenderer.renderNote(e),this.renderNoteOptions(),this.noteDisplayTime=Date.now()}renderNoteOptions(){if(this.clearNoteOptions(),!this.currentLevel)return;const e=this.currentLevel.getAvailableNotes(),t=this.currentLevel.getCurrentNote();this.keyboardRenderer.renderKeyboard(e,(e=>{this.checkAnswer(e)}),t.clef)}checkAnswer(e){if(!this.currentLevel)return;const t=this.currentLevel.getCurrentNote(),n=t.name===e.name,o=t.octave===e.octave,s=n&&o;this.state.noteHistory[t.name]||(this.state.noteHistory[t.name]={correct:0,incorrect:0});const a=Date.now(),i=(a-this.noteDisplayTime)/1e3;this.state.recentAttempts||(this.state.recentAttempts=[]),this.state.recentAttempts.push({isCorrect:s,timeSpent:i,timestamp:a}),s?(this.state.noteHistory[t.name].correct+=1,this.showFeedback(!0,`Correct! That's ${t.name}${t.octave}`)):(this.state.noteHistory[t.name].incorrect+=1,n?o||this.showFeedback(!1,`Incorrect. Right note name (${t.name}), but wrong octave. It was ${t.name}${t.octave}, you selected ${e.name}${e.octave}`):this.showFeedback(!1,`Incorrect. That was ${t.name}${t.octave}, not ${e.name}${e.octave}`)),this.updateStats(),this.storageManager.saveState(this.state),setTimeout((()=>{this.moveToNextNote()}),100)}moveToNextNote(){this.currentLevel&&(this.state.recentAttempts&&this.currentLevel.isComplete(this.state.recentAttempts)?this.levelUp():(this.currentLevel.nextNote(),this.displayCurrentNote()))}levelUp(){if(this.state.currentLevelIndex++,this.state.recentAttempts=[],this.storageManager.saveState(this.state),this.state.currentLevelIndex<c.levels.length){const e=c.levels[this.state.currentLevelIndex];this.showFeedback(!0,`Level Up! Moving to level ${this.state.currentLevelIndex+1}: ${e.name}`),setTimeout((()=>{this.loadLevel(this.state.currentLevelIndex)}),2e3)}else this.showFeedback(!0,"Congratulations! You've completed all levels!"),this.state.isGameRunning=!1}showFeedback(e,t){this.feedbackElement.textContent=t,this.feedbackElement.className=e?"correct":"incorrect"}clearFeedback(){this.feedbackElement.textContent="",this.feedbackElement.className=""}calculateCurrentStreak(){if(!this.state.recentAttempts||0===this.state.recentAttempts.length)return 0;let e=0;for(let t=this.state.recentAttempts.length-1;t>=0&&this.state.recentAttempts[t].isCorrect;t--)e++;return e}calculateAverageSpeed(){if(!this.state.recentAttempts||0===this.state.recentAttempts.length)return 0;const e=c.levels[this.state.currentLevelIndex],t=e?.requiredSuccessCount||c.LEVEL_CRITERIA.requiredSuccessCount,n=this.state.recentAttempts.slice(-t);return n.reduce(((e,t)=>e+t.timeSpent),0)/n.length}updateStats(){const e=this.calculateCurrentStreak();this.streakElement&&(this.streakElement.textContent=e.toString());const t=this.calculateAverageSpeed();if(this.speedElement&&(this.speedElement.textContent=t.toFixed(1)),this.updateVisualFeedback(),4===e){const e=Date.now();e-this.lastStreakAnimation>5e3&&(this.showCartoonCharacter(),this.lastStreakAnimation=e)}}updateLevelRequirements(){if(!this.currentLevel)return;const e=c.levels[this.state.currentLevelIndex],t=e?.requiredSuccessCount||c.LEVEL_CRITERIA.requiredSuccessCount,n=e?.maxTimePerProblem||c.LEVEL_CRITERIA.maxTimePerProblem;this.streakRequiredElement&&(this.streakRequiredElement.textContent=t.toString()),this.speedRequiredElement&&(this.speedRequiredElement.textContent=n.toString())}updateVisualFeedback(){if(!this.streakElement||!this.speedElement)return;const e=this.calculateCurrentStreak(),t=this.calculateAverageSpeed(),n=c.levels[this.state.currentLevelIndex],o=n?.requiredSuccessCount||c.LEVEL_CRITERIA.requiredSuccessCount,s=n?.maxTimePerProblem||c.LEVEL_CRITERIA.maxTimePerProblem;this.streakElement.className=e>=o?"goal-met":e>=o/2?"progress":"",this.speedElement.className=t>0&&t<s?"goal-met":t>0&&t<1.5*s?"progress":""}clearNoteOptions(){this.noteOptionsContainer.innerHTML=""}showCartoonCharacter(){this.removeCharacterElement();const e=g[Math.floor(Math.random()*g.length)],t=e.messages[Math.floor(Math.random()*e.messages.length)];this.characterElement=document.createElement("div"),this.characterElement.className="cartoon-character-popup";const n=`\n            <div class="character-avatar">\n                <img src="${e.avatar}" alt="${e.name}">\n            </div>\n            <div class="character-content">\n                <h3>${e.name}</h3>\n                <p>${t}</p>\n            </div>\n        `;this.characterElement.innerHTML=n,document.body.appendChild(this.characterElement),setTimeout((()=>{this.characterElement&&this.characterElement.classList.add("visible")}),10),setTimeout((()=>{this.removeCharacterElement()}),9e3)}removeCharacterElement(){this.characterElement&&document.body.contains(this.characterElement)&&(this.characterElement.classList.remove("visible"),setTimeout((()=>{this.characterElement&&document.body.contains(this.characterElement)&&(document.body.removeChild(this.characterElement),this.characterElement=null)}),500))}}var b=n(72),v=n.n(b),x=n(825),y=n.n(x),w=n(659),k=n.n(w),C=n(56),S=n.n(C),N=n(540),E=n.n(N),L=n(113),I=n.n(L),A=n(552),P={};P.styleTagTransform=I(),P.setAttributes=S(),P.insert=k().bind(null,"head"),P.domAPI=y(),P.insertStyleElement=E(),v()(A.A,P),A.A&&A.A.locals&&A.A.locals,document.addEventListener("DOMContentLoaded",(()=>{const e=new f,t=new h("music-reading-game"),n=document.getElementById("start-button"),o=document.getElementById("reset-button"),s=document.getElementById("clear-storage-button"),a=document.getElementById("stats-button"),i=document.getElementById("toggle-names-button"),r=document.getElementById("toggle-all-keys-button"),l=document.getElementById("stats-popup"),d=document.querySelector(".close-button"),p=document.getElementById("learned-notes-list"),m=document.getElementById("levels-list"),u=document.getElementById("level-selection");function g(){e.isGameRunning()?n.style.display="none":n.style.display="block"}g(),n.addEventListener("click",(()=>{console.log("Start button clicked"),e.start(),g()})),o.addEventListener("click",(()=>{console.log("Reset button clicked"),e.reset(),g()})),s.addEventListener("click",(()=>{console.log("Clear Storage button clicked"),t.clearState(),alert("Storage cleared! Refresh the page to start with fresh state."),l.classList.remove("active")})),i.addEventListener("click",(()=>{const t=e.keyboardRenderer;if(t){t.toggleNoteNames();const n=t.showNoteNames;if(i.textContent=n?"Hide Note Names":"Show Note Names",e.isGameRunning()){const n=e.currentLevel;if(n){const o=n.getAvailableNotes();t.renderKeyboard(o,(t=>{e.checkAnswer(t)}))}}}})),r.addEventListener("click",(()=>{const t=e.keyboardRenderer;if(t){t.toggleShowAllKeys();const n=t.showAllKeys;if(r.textContent=n?"Hide Unavailable Notes":"Show All Notes",e.isGameRunning()){const n=e.currentLevel;if(n){const o=n.getAvailableNotes();t.renderKeyboard(o,(t=>{e.checkAnswer(t)}))}}}})),a.addEventListener("click",(()=>{console.log("Stats button clicked"),function(){p.innerHTML="";const e=t.loadState();if(!e)return void(p.innerHTML="<p>Start the game to see learned notes!</p>");const n=e.currentLevelIndex,o=c.levels;if(n<0||n>=o.length)return void(p.innerHTML="<p>No notes learned yet.</p>");const s=o[n];let a=[];0===n?a=s.notes:s.learnedNotes?(a=[...s.learnedNotes],s.newNote&&a.push(s.newNote)):a=s.notes;const i=a.filter((e=>"treble"===e.clef)),r=a.filter((e=>"bass"===e.clef));if(i.length>0){const e=document.createElement("div");e.className="note-group",e.innerHTML=`\n                <h4>Treble Clef Notes</h4>\n                <div class="level-notes">\n                    ${i.map((e=>`<span class="note-tag">${e.name}${e.octave}</span>`)).join("")}\n                </div>\n            `,p.appendChild(e)}if(r.length>0){const e=document.createElement("div");e.className="note-group",e.innerHTML=`\n                <h4>Bass Clef Notes</h4>\n                <div class="level-notes">\n                    ${r.map((e=>`<span class="note-tag">${e.name}${e.octave}</span>`)).join("")}\n                </div>\n            `,p.appendChild(e)}0===i.length&&0===r.length&&(p.innerHTML="<p>No notes learned yet.</p>")}(),function(){m.innerHTML="";const e=c.levels,n=t.loadState(),o=n?n.currentLevelIndex:-1;e.forEach(((e,t)=>{const n=document.createElement("div");n.className="level-item",t===o&&(n.style.borderLeftColor="#e74c3c");const s=e.notes.map((t=>`<span class="note-tag ${e.newNote&&t.name===e.newNote.name&&t.clef===e.newNote.clef&&t.position===e.newNote.position&&t.octave===e.newNote.octave?"new":""}">${t.name}${t.octave} (${t.clef})</span>`)).join("");n.innerHTML=`\n                <div class="level-title">Level ${e.id}: ${e.name} ${t===o?"(Current)":""}</div>\n                <div class="level-description">${e.description}</div>\n                <div class="level-notes">\n                    ${s}\n                </div>\n            `,m.appendChild(n)}))}(),function(){u.innerHTML="";const n=t.loadState(),o=n?n.currentLevelIndex:0;c.levels.forEach(((t,n)=>{const s=document.createElement("button");s.className="level-button",n===o&&s.classList.add("current"),s.textContent=`Level ${n+1}: ${t.name}`,s.addEventListener("click",(()=>{e.setLevel(n),l.classList.remove("active"),e.isGameRunning()||(e.start(),g())})),u.appendChild(s)}))}(),l.classList.add("active")})),d.addEventListener("click",(()=>{l.classList.remove("active")})),window.addEventListener("click",(e=>{e.target===l&&l.classList.remove("active")}))}))})();