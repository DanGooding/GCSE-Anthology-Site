

window.onbeforeunload = function () {
    gotoTop();
}
$(document).ready(function() {
    $("#aboutButton").click();
    showAboutPage();
});

var adjustContentOffset;
window.onresize = function() {
    clearTimeout(adjustContentOffset);
    adjustContentOffset = setTimeout(resetTopSpacing, 100);
};

function gotoTop() {
    window.scrollTo(0, 0);
}

function toggleMenu() {
    if ($("#nav").hasClass("open")) {
        $("#nav").removeClass("open");
    }else {
        $("#nav").addClass("open");
    }
}

function resetTopSpacing() {
    if ($(window).width() < 700/*$(".navButton.expand").is(":visible")*/ /*$("#nav").hasClass("open")*/) {

        var h1=$("#header").outerHeight(true);
        var h2=$(".navButton.expand").outerHeight(true);
        $("#content").css({"margin-top": h1+h2});
    }else {
        $("#nav").removeClass("open");
        $("#content").css({"margin-top": $("#headerContainer").outerHeight(true)+20});
    }

}

$(document).on('keypress', 'input,select', function(e) {
    if (e.which == 13) {
        e.preventDefault();

        var fields = $('input.word');
        var index = fields.index(this) + 1;
        if (index >= fields.length) {
            $("#markButton").focus();
        }
        fields.eq(index).focus();
    }
});

function showAboutPage() {
    $("#test").hide();
    $("#about").show();
    $("#markButton").hide();
    $("#scorePopup").hide();
    $("#poemTitle").hide();

    $(".navButton").removeClass("current");
    $("#aboutButton").addClass("current");

    $("#content").css({"margin-bottom":"0"});

    if ($("#nav").hasClass("open")) {
        toggleMenu();
    }
    resetTopSpacing();
    gotoTop();

}
function showTestPage() {
    // gotoTop();

    $("#test").show();
    $("#about").hide();
    $("#markButton").show();
    $("#scorePopup").hide();

    $("#content").css({"margin-bottom":"300px"});

    toggleMenu();
    resetTopSpacing();
    gotoTop();

}


function clicked(button) {
    $(".navButton").removeClass("current");
    // if (poemName != "Random") {
    $(button).addClass("current");

    if ($(button).attr("id")=="aboutButton") {
        showAboutPage();

        return;
    }

    showTestPage();
    if ($(button).attr("id") == "random") {
        var buttons = $(".poemSelect").toArray()
        var idx = getRandomInt(0,buttons.length-1)
        buttons[idx].click();
        return;
    }
    var poemName = button.innerHTML;//.replace("é","e");//.replace(/\s+/g,'_');

    //removeSpaces(button.innerHTML);

    var nameWithoutAccents = $(button).attr("data-nameWithoutAccents");
    if (nameWithoutAccents) {
        setupPoem(nameWithoutAccents, poemName);
    }else {
        setupPoem(poemName);
    }
    // setupPoem(poemName)
    //event.currentTarget.className += " current";

    gotoTop();
    $("#container").scrollTop(0);
}

function setupPoem(poemName, displayName) {

    var poemId = poemName.replace(/\s+/g,'_');
    var poem = $("#"+poemId+".poem").html();
    var poet = $("#"+poemId+".poem").attr("data-poet");

    $("#test").html(poem);
    $("#test").show();

    var lines = poem.split("\n");/*.filter(function(x) {
        return (removeSpaces(x) != "");
    });*/

    //remove leading & trailing newlines
    if (removeSpaces(lines[0])=="") {
        lines.splice(0,1);
    }
    if (removeSpaces(lines[lines.length-1])=="") {
        lines.splice(lines.length-1,1);
    }

    var displayedLines = lines;//.splice(-1, 1);


    for (var i=0; i<lines.length; i++) {
        var content = lines[i];

        var words = content.split(/\W/);//split by non words
        words = words.filter(isHideableWord);

        if (words.length == 0) {//no valid words on this line
            continue;
        }

        var hidden = words[getRandomInt(0, words.length-1)]

        var box = "<input type=\"text\" class=\"word\" data-answer=\"" + hidden +
                    "\" size=\"" + (hidden.length) +
                    "\" maxlength=\"" + (hidden.length) +
                    "\" placeholder=\"" + "?".repeat(hidden.length) +
                    "\">";

        var shown = content.replace(hidden, box);

        displayedLines[i] = shown;
    }

    $("#test").html(/*"<h1 id=\"poemTitle\">" + poemName + "</h1>" +*/ /*"<br>" +*/
        "<pre><span class=\"displayedPoem\">" + displayedLines.join("\n") + "</span></pre>" +
        "<p class=\"poet\">- " + poet + "&nbsp;</p>"
        );

    $("#test").show();

    $("#markButton").prop("disabled", false);

    $("#poemTitle").show();
    $("#poemTitle").html(displayName || poemName);
    // $("#"+poemName).show();
    // $("button.poemSelect").prop("disabled", true

    // $(window).scrollTop(0);
    gotoTop();

    $('input.word').eq(0).focus();
}

function mark() {
    var correct = 0, wrong = 0
    $("input.word").each(function() {
        var guess = $(this).val();
        if (guess == "") {
            guess = $(this).attr("placeholder");
        }
        var answer = $(this).attr("data-answer");

        if (guess.toLowerCase() == answer.toLowerCase()) {
            correct++;
            $(this).replaceWith("<span class=\"correct\">"+answer+"</span");
        }else {
            wrong++;
            $(this).replaceWith("<span class=\"incorrect\"><del>" + guess + "</del></span>" +
            " <ins class=\"answer\">"+answer+"</ins>");
        }
    })
    //alert(correct+" correct\nand "+wrong+" wrong")
    // $("button.poemSelect").prop("disabled", false);

    $("#markButton").prop("disabled", true);
    $("#markButton").hide();

    var total = correct + wrong;
    var proportionCorrect = correct/total;

    var correctMessage = correct + " Correct" + "!".repeat(Math.floor(proportionCorrect*10));


    var incorrectMessage = wrong + " Incorrect";

    var scoreComments = ["anybody there?", "umm...", "have another go", "getting there", "not bad", "well done!", "nice!", "so close!","full marks!!"];


    var scoreMessage;
    if (correct == 0) {
        scoreMessage = scoreComments[0];
    }else if (correct == 100) {
        scoreMessage = scoreComments[scoreComments.length-1];
    }else {
        var steps = scoreComments.length-2;
        var stepSize = 1/steps;
        var i = 0;
        while (proportionCorrect >= stepSize * i) {
            i++;
        }
        scoreMessage = scoreComments[i];
    }

    $("#correctPopup").html(correctMessage);
    $("#incorrectPopup").html(incorrectMessage);
    $("#scoreMessage").html(scoreMessage);
    $("#scorePopup").show();
}




// UTILS

var disallowedWords = ["the","and","that","these","there", "has", "had", "was","with"];
function isHideableWord(word) {
    if (word.length < 3) {
        return false;
    }
    if (disallowedWords.includes( word.toLowerCase() )) {
        return false;
    }
    return true;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function removeSpaces(str) {
    return str.replace(/\s+/g,'');
}
