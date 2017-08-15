/*global localStorage*/
var pos = require("pos");
var Wikiquote = require("wikiquotes");

var colorButtons = document.querySelectorAll(".colorBtn");
var colorKeyBody = document.querySelector("#colorKeyBody");
var correctBar = document.querySelector(".correct");
var incorrectBar = document.querySelector(".incorrect");
var solveBtn = document.querySelector(".solve");
var nextBtn = document.querySelector(".next");
var pointsAmount = document.querySelector(".pointsAmount");
var sentenceContainer = document.querySelector(".sentence");
var currentPOS = document.querySelector(".currentPOS");
var badgePage = document.querySelector(".badgePage");
var loadingScreen = document.querySelector(".loadingSentence");

var people = [
  "Mahatma Gandhi",
  "Abraham Lincoln",
  "John F. Kennedy",
  "Bill Gates",
  "Christopher Columbus",
  "George Orwell",
  "Queen Victoria",
  "John M Keynes",
  "Leo Tolstoy",
  "Albert Einstein",
  "Babe Ruth",
  "Franklin D. Roosevelt",
  "Dalai Lama",
  "Martin Luther King, Jr.",
  "Leonardo da Vinci",
  "Richard Branson",
  "Richard Feynman",
  "Henry Ford",
  "Coco Chanel",
  "Walt Disney",
  "Edgar Allan Poe",
  "Sigmund Freud",
  "Thomas A. Edison",
  "Usain Bolt",
  "J.R.R. Tolkien",
  "Socrates",
  "Plato",
  "Alexander the Great",
  "Charlemagne",
  "Galileo Galilei",
  "Voltaire",
  "Archimedes",
  "Rene Descartes",
  "Napoleon Bonaparte",
  "Tim Berners Lee",
  "Stephen Hawking",
  "Marie Antoinette",
  "Steve Jobs"
];

var tokenToPOS = {
  "DT": "determiner",
  "WDT": "determiner",
  "IN": "preposition",
  "JJ": "adjective",
  "JJR": "adjective",
  "JJS": "adjective",
  "NN": "noun",
  "NNP": "noun",
  "NNS": "noun",
  "NNPS": "noun",
  "RB": "adverb",
  "RBS": "adverb",
  "RBR": "adverb",
  "WRB": "adverb",
  "VB": "verb",
  "VBP": "verb",
  "VBZ": "verb",
  "VBD": "verb",
  "VBN": "verb",
  "VBG": "verb",
  "PP$": "pronoun",
  "PRP$": "pronoun",
  "WP": "pronoun",
  "PRP": "pronoun",
  "MD": "modal",
  "UH": "interjection",
  "CC": "conjunction"
};

var keyInfo = [
  ["nounBtn","Noun"],
  ["verbBtn","Verb"],
  ["adjBtn","Adjective"],
  ["pronounBtn","pronoun"],
  ["adverbBtn","Adverb"],
  ["prepBtn","Preposition"],
  ["determinerBtn","Determiner"],
  ["conjBtn","Conjunction"],
  ["modalBtn","Modal"],
  ["intBtn", "Interjection"]
];

var person;
var wordState;
var POS = "noun";
var sentence;
var points;

/*

 sentenceActions.getSentence
Get new sentence (quote) using the Wikiquote api and wikiquotes package wrapper.

 sentenceActions.cleanSentence
Make sure that sentences shown will 
produce fairly accurate parts of speech when solved.

 sentenceActions.addSentence
Add a sentence and author to the DOM

*/


var sentenceActions = {
  
  getSentence: function(){
    loadingScreen.className = "loadingSentence";
    wordState = [];
    person = people[Math.floor(Math.random() * people.length)];
    Wikiquote.getRandomQuote(person, function(data){
      //regex from http://stackoverflow.com/questions/15458876/check-if-a-string-is-html-or-not
      if(/<[a-z][\s\S]*>/i.test(data.quote) === true || data.quote == undefined || data.quote.trim().length === 0){
        sentenceActions.getSentence();
      } else {
        sentenceActions.addSentence(data);
      }
    }, function(err){
      console.error(err);
      if(err == "No results"){
        sentenceActions.getSentence();
      }
    });
  },
  
  cleanSentence: function(s) {
    var contractions = ["ll","d","ve","re","t","s","m"];
    var valid = true;
    var cleanedSentence = s.quote.replace(/\u2013|\u2014/g, "-").split(/([\.,\-\r?!@"';:#$%^&*()\[\] ])/g).reduce(function(arr,x) {
      if(x.trim().length > 0){
        // deal with contractions
        if(contractions.indexOf(x) != -1){
          console.error("contraction, skipping sentence.");
          valid = false;
        }
        // deal with numbers next to letters 
        if(x.match(/\d\w*$/g)){
          console.error("numbers next to letters, skipping sentence.");
          valid = false;
        }
    	  arr.push(x);
      }
      return arr;
    },[]);
    return (valid === true) ? cleanedSentence : false;
  },
  
  addSentence: function(s) {
    sentence = this.cleanSentence(s);
    if(!sentence){
      this.getSentence();
    } else {
      sentenceContainer.innerHTML = "";
      
      sentence.forEach(function(x,i){
        var span = document.createElement("span");
        span.className = "word";
        span.keyNum = i;
        var text = document.createTextNode(x);
        span.appendChild(text);
        span.addEventListener("click",actions.toggleTag);
        sentenceContainer.appendChild(span);
        
        wordState.push([x,undefined]);
      });
      
      var personContainer = document.querySelector(".person");
      var text = document.createTextNode(person);
      personContainer.removeChild(personContainer.firstChild);
      personContainer.appendChild(text);
      loadingScreen.className = "loadingSentence hidden";
    }
  }
  
};

/*

 init.initColorButtons
Initialize all buttons with color associated to POS.
  
 init.initPoints
Setup the points counter grabbing the points value from localStorage if it exists.
 
 init.initPageToggling
Setup page toggling between help page and main page.

 init.initActionButtons_
Setup action buttons (next. solve).
  
 init.makeColorKeyTable
From keyInfo array, make a table describing the color to POS assosiation in the Help page. 

*/

var init = {
  
  updateCurrentPOS: function () {
    var text = document.createTextNode(POS);
    currentPOS.removeChild(currentPOS.firstChild);
    currentPOS.appendChild(text);
  },
  
  initColorButtons: function() {
    function resetColorButtons() {
      Array.prototype.forEach.call(colorButtons, function(btn){
        if(btn.className.split(' ').length == 3){
          var newClassName = btn.className.split(' ');
          newClassName.length = 2;
          newClassName = newClassName.join(' ');
          btn.className = newClassName;
        }
      });
    }
    Array.prototype.forEach.call(colorButtons ,function(btn) {
      btn.addEventListener('click', function(){
        resetColorButtons();
        btn.className += " selectedBtn";
        POS = btn.title.toLowerCase();
        init.updateCurrentPOS();
      });
    });
  },
  

  initPoints: function() {
    if(localStorage) {
      points = +(localStorage.getItem('points') || 0);
    } else {
      points = 0;
    }
    var pointsText = document.createTextNode(points);
    pointsAmount.appendChild(pointsText);
  },
  
  initPageToggling: function() {
    function replaceText(element, t) {
      element.removeChild(element.firstChild);
      var text = document.createTextNode(t);
      element.appendChild(text);
    }
    var helpToggle = document.querySelector(".help");
    var helpPage = document.querySelector(".helpPage");
    var mainPage = document.querySelector(".mainPage");
    
    var badgeToggle = document.querySelector(".badges");
    
    helpToggle.addEventListener('click', function(){
      badgePage.className = "badgePage hidden";
      replaceText(badgeToggle,"Badges");
      if(helpPage.className == "helpPage"){
        helpPage.className += " hidden";
        mainPage.className = "mainPage";
        replaceText(helpToggle,"Help");
      } else {
        mainPage.className += " hidden";
        helpPage.className = "helpPage";
        replaceText(helpToggle,"Main");
      }
    });
    
    badgeToggle.addEventListener("click", function() {
      helpPage.className = "helpPage hidden";
      replaceText(helpToggle,"Help");
      if(badgePage.className == "badgePage hidden") {
        badgePage.className = "badgePage";
        mainPage.className += " hidden";
        replaceText(badgeToggle,"Main");
      } else {
        badgePage.className += " hidden";
        mainPage.className = "mainPage";
        replaceText(badgeToggle,"Badges");
      }
    });
  },
  
  initActionButtons: function() {
    nextBtn.disabled = true;
    solveBtn.addEventListener("click", actions.solveSentence.execute);
    nextBtn.addEventListener("click", actions.nextSentence);
  },
  
  initColorKeyTable: function() {
    keyInfo.forEach(function(item) {
      var tableRow = document.createElement("tr");
      var tableColorTip = document.createElement("td");
      var colorTip = document.createElement("div");
      var tableColorName = document.createElement("td");
      var colorText = document.createTextNode(item[1]);
      
      colorTip.className = "colorTip " + item[0];
      tableColorTip.appendChild(colorTip);
      tableColorName.appendChild(colorText);
      tableRow.appendChild(tableColorTip);
      tableRow.appendChild(tableColorName);
      colorKeyBody.appendChild(tableRow);
    });
  },
  
  initialize: function() {
    init.initColorButtons();
    init.initActionButtons();
    init.initPageToggling();
    init.initPoints();
    init.initColorKeyTable();
    init.updateCurrentPOS();
    
    nextBtn.disabled = true;
    solveBtn.disabled = false;
    
    badgeActions.updateBadges();
    sentenceActions.getSentence();
  }
  
};

/*
actions include functions by action buttons and functions that are triggered on events.

 actions.solveSentence.matchPunctuation
will push punctuation found as belonging to an 'other' pos category.
 
 actions.solveSentence.matchPOSToWord
For each word in DOM setence, will match and give the correct underline color
representing POS that the word was determined to be. Also handles adding # of points
on correct guess.

 actions.solveSentence.updateBar
Updates the DOM representation (a small bar) of the percentage correct and incorrect guesses
in the newly solved sentence

 actions.toggleTag
When clicking on a word toggle the underline (with color dependent on current POS selected)

*/
    
var actions = {
  
  solveSentence: {
    totalCorrect: 0,
    words: "",
    tagger: "",
    tgs: "",
    execute: function() {
      var solve = actions.solveSentence;
      solve.totalCorrect = 0;
      solveBtn.disabled = true;
      nextBtn.disabled = false;
      
      solve.words = new pos.Lexer().lex(sentence.join(' '));
      solve.tagger = new pos.Tagger();
      solve.tgs = solve.matchPunctuation();
      solve.matchPOSToWord();
      solve.updateBar();
    },
    
    matchPunctuation: function() {
      var t;
      t = this.tagger.tag(this.words).reduce(function(arr,tag) {
        if(tag[0].match(/[,.\-;:."'?!@#$%^&*()\[\]]/) === null){
          arr.push(tag);
        } else {
          arr.push([".","punctuation"]);
        }
        return arr;
      },[]);
      return t;
    },
    
    matchPOSToWord: function() {
      this.tgs.forEach(function(tag,i) {
        var word = document.querySelectorAll(".word")[i];
        if(word){
          tokenToPOS[tag[1]] = tokenToPOS[tag[1]] ? tokenToPOS[tag[1]] : "other";
          word.className = "word underline " + tokenToPOS[tag[1]];
          
          if(tokenToPOS[tag[1]] == wordState[i][1]){
            word.style.color = "#08A045";
            this.totalCorrect += 1;
            pointActions.addPoints(5);
          } else {
            word.style.color = "#E71D36";
          }
        }
      });
    },
  
    updateBar: function() {
      var correctPercent = Math.floor((this.totalCorrect/this.words.length).toString().slice(0,4) * 100);
      var incorrectPercent = 100 - correctPercent + "%";
      correctPercent += "%";
      correctBar.style.width = correctPercent;
      incorrectBar.style.width = incorrectPercent;
      correctBar.title = "Percent correct: " + correctPercent;
      incorrectBar.title = "Percent incorrect: " + incorrectPercent;
    }
  },
  
  nextSentence: function() {
    nextBtn.disabled = true;
    solveBtn.disabled = false;
    sentenceActions.getSentence();
  },
  
  toggleTag: function() {
    var word = document.querySelectorAll(".word")[this.keyNum];
    if(word.className != "word underline " + POS){
      word.className = "word underline " + POS;
      wordState[this.keyNum][1] = POS;
    } else {
      word.className = "word underline";
      wordState[this.keyNum][1] = undefined;
    }
  }
};

/*

 pointActions.addPoints
Add <amount> number of points to the current amount.
Remove points counter from DOM and replace it with updated current amount.

*/

var pointActions = {
  
  addPoints: function(amount) {
    points += amount;
    if(localStorage) {
      localStorage.setItem("points", points);
    }
    var pointsText = document.createTextNode(points);
    pointsAmount.removeChild(pointsAmount.firstChild);
    pointsAmount.appendChild(pointsText);
    badgeActions.updateBadges();
  }
  
};

/*

 badgeActions.updateBadges
update which badges have been earned depending on how many points user has.

*/

var badgeActions = {
  
  updateBadges: function() {
    var pointsRequirments = [50,100,250,500,1000,10000];
    pointsRequirments.forEach(function(x,i) {
      if(points >= x) {
        badgePage.children[i+1].className = "";
      }
    });
  }
  
};

init.initialize();