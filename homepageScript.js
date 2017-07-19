
// when the window loads, ensure the scrolling is reset ot the top
window.onbeforeunload = function () {
    gotoTop();
}
$(document).ready(function() {
    $("#aboutButton").click(); // simulate a click of the 'about' button to ensure the site loads on the about page
    showAboutPage();
});

var adjustContentOffset;
window.onresize = function() { // when window resized
    // 0.1s after finished resizing,
    // call the 'resetTopSpacing' function to ensure the header never overlaps the content

    clearTimeout(adjustContentOffset);// still resixing so don't schedule yet
    adjustContentOffset = setTimeout(resetTopSpacing, 100);// schedule reset top spacing in 0.1s
};

function gotoTop() { // scrolls the page back to the top - used when starting poems etc.
    window.scrollTo(0, 0);
}

function toggleMenu() { // called on mobile when show menu button toggled
    if ($("#nav").hasClass("open")) { // if menu open then close
        $("#nav").removeClass("open");
    }else { // else menu closed so open
        $("#nav").addClass("open");
    }
}

function resetTopSpacing() {
    // move the content down enough so it is not overlapped by the header
    if ($(window).width() < 700) {
        var h1=$("#header").outerHeight(true);
        var h2=$(".navButton.expand").outerHeight(true);
        $("#content").css({"margin-top": h1+h2}); //calculate height of header
    }else {
        $("#nav").removeClass("open");
        $("#content").css({"margin-top": $("#headerContainer").outerHeight(true)+20});
    }

}

/// this function moves cursor to next missing word (or mark button when done) when 'enter' is pressed:
// if a key is pressed in an input field (e.g. textbox)
$(document).on('keypress', 'input,select', function(e) {
    if (e.which == 13) {// if the enter key was pressed (code 13)
        e.preventDefault(); // prevent enter from creating a newline

        var fields = $('input.word');//get all missing word textboxes (inputs)
        var index = fields.index(this) + 1; //find the next one
        if (index >= fields.length) {//if this is the last one
            $("#markButton").focus();//focus the 'mark' button
            return;
        }
        fields.eq(index).focus(); //otherwise focus next missing wrd
    }
});

function showAboutPage() {
    // hide everything from the poem test page
    $("#test").hide();
    $("#markButton").hide();
    $("#scorePopup").hide();
    $("#poemTitle").hide();

    $("#about").show();

    $(".navButton").removeClass("current");
    $("#aboutButton").addClass("current"); // switch button highlight to the about button

    $("#content").css({"margin-bottom":"0"}); // prevent scroll past bottom

    if ($("#nav").hasClass("open")) { // if menu open (mobile) then close it
        toggleMenu();
    }
    resetTopSpacing();
    gotoTop();

}

 // if hints on then show first letter of each missing word
var hintsEnabled = false;

function showTestPage() { // shows selected poem with words missing
    hintsEnabled = $("#hintsEnabled:checked").val() ? true : false; //get state of hints switch

    $("#test").show();
    $("#about").hide();
    $("#markButton").show();
    $("#scorePopup").hide();

    // allow scolling a little past the end
    $("#content").css({"margin-bottom":"300px"});

    toggleMenu();
    resetTopSpacing();
    gotoTop();

}


// a navigation button has been clicked
function clicked(button) {
    //$("#poemTitle").removeClass("animate");

    $(".navButton").removeClass("current");
    $(button).addClass("current"); // highlight only this button

    if ($(button).attr("id")=="aboutButton") { // if selected the about page go to it
        showAboutPage();
        return;
    }
    // otherwise, a poem has been selected to begin the test

    if ($(button).attr("id") == "random") { // if the 'random' button was pressed
        var buttons = $(".poemSelect").toArray()
        var idx = getRandomInt(0,buttons.length-1)
        buttons[idx].click(); // artificially trigger a click event ona random poem select button
        return;
    }
    showTestPage(); //show & hide relevant sections

    var poemName = button.innerHTML; // get the name of the selected poem from the clicked button

    //handle 'The Emigrée' without an accent, as not handled properly by HTML
    var nameWithoutAccents = $(button).attr("data-nameWithoutAccents");
    if (nameWithoutAccents) { // is has accents, handle without
        setupPoem(nameWithoutAccents, poemName);
    }else {
        setupPoem(poemName); //else setup poem normally
    }

    gotoTop();
    $("#container").scrollTop(0);
}

function setupPoem(poemName, displayName) {

    var poemId = poemName.replace(/\s+/g,'_'); //replace spaces (\s) in name with underscores - since element id's cant include spaces
    var poem = $("#"+poemId+".poem").html(); // retrieve the poem using its id
    var poet = $("#"+poemId+".poem").attr("data-poet"); // alo get the poem's name

    $("#test").html(poem); // insert the poem in to the 'test' element for display
    $("#test").show();

    var lines = poem.split("\n"); // split by newline(\n), into an array of the lines

    //remove leading & trailing newlines
    if (removeSpaces(lines[0])=="") { // if first line is empty, remove
        lines.splice(0,1);
    }
    if (removeSpaces(lines[lines.length-1])=="") { // if last line is empty, remove
        lines.splice(lines.length-1,1);
    }

    var displayedLines = lines;

    for (var i=0; i<lines.length; i++) { // remove 1 word per line
        var content = lines[i];

        var words = content.split(/\W/); //split by non words (e.g. spaces)
        // also split by apostrophe (e.g. "husband's" becomes "husband", "s", of which "s" is too short)
        // this means user's doent have to remember apostrophe placement
        // preventing loss of marks for "blundered" instead of "blunder'd"

        words = words.filter(isHideableWord);
        // remove words which are not 'hideable' e.g. too short, or common (e.g. "the")


        if (words.length == 0) {
        // if no hideable words on this line, don't hide any words - go to next line
            continue;
        }

        var hidden = words[getRandomInt(0, words.length-1)]; // pick a random word to hide

        // replace with a many question marks as letters in the word
        var placeholder = "?".repeat(hidden.length);
        if (hintsEnabled) {
            // replace first "?" with first letter of word if hints on
            placeholder = hidden[0] + placeholder.substr(1, placeholder.length);
        }

        // create the text box (an 'input' element)
        var box = "<input type=\"text\" class=\"word\" data-answer=\"" + hidden +
                    "\" size=\"" + (hidden.length) +
                    "\" maxlength=\"" + (hidden.length) +
                    "\" placeholder=\"" + placeholder +
                    "\" autocapitalize=\"none\"" +
                    "\">";
        // 'size' sets the maximum number of letters that can be typed,
        //preventing the user typing a guess longer than the word

        // 'maxlength' sets the text box big enough to display a given number of letters
        //works on average width, so 'llll' will leave space but 'mmmm' wont (when not in this monospace font)

        // 'placeholder' is the default text when empty - "????" in this case


        // replace the hidden word with the textbox
        var shown = content.replace(hidden, box);

        displayedLines[i] = shown; // overwrite this line (now with the a word)
    }

    // insert the joined lines into the 'test' element
    $("#test").html(
        "<pre><span class=\"displayedPoem\">" + displayedLines.join("\n") + "</span></pre>" +
        "<p class=\"poet\">- " + poet + "&nbsp;</p>"
        );

    $("#test").show();

    // make the 'mark' button active
    $("#markButton").prop("disabled", false);

    //$("#poemTitle").addClass("animate");

    // set & show the poem title (including accents if applicable)
    $("#poemTitle").show();
    $("#poemTitle").html(displayName || poemName);

    gotoTop();

    $('input.word').eq(0).focus(); // focus (put the cursor in) the first missing word textbox
}

function mark() { // mark the user's input
    var correct = 0, wrong = 0
    $("input.word").each(function() { // for each missing word
        var guess = $(this).val();
        if (guess == "") { // if no guess, guess was default "?????"
            guess = $(this).attr("placeholder");
        }
        var answer = $(this).attr("data-answer"); // retrive the answer - the missing word

        if (guess.toLowerCase() == answer.toLowerCase()) { // compare, ignoring capitals
            correct++; // if same then onme more correct
            // remove the textbox and insert the (correctly capitalised) answer
            $(this).replaceWith("<span class=\"correct\">"+answer+"</span");
        }else {
            wrong++; // one more wrong

            // show the user's incorrrect guess in red & crossed out,
            // and the correct answer next to it in green
            $(this).replaceWith("<span class=\"incorrect\"><del>" + guess + "</del></span>" +
            " <ins class=\"answer\">"+answer+"</ins>");
        }
    })

    $("#markButton").prop("disabled", true);
    $("#markButton").hide(); // marked so remove the mark button

    var total = correct + wrong;
    var proportionCorrect = correct/total;

    // display the numer right (5 Correct) and wrong (2 Incorrect)

    // up to 5 '!' available, depending on score
    var correctMessage = correct + " Correct" + "!".repeat(Math.floor(proportionCorrect*5));

    var incorrectMessage = wrong + " Incorrect";

    // comments on score from 0 to 100 %
    var scoreComments = ["anybody there?", "umm...", "have another go", "getting there", "not bad", "well done!", "nice!", "so close!","full marks!!"];

    // select respective score comment
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

    // display to the user their results
    $("#correctPopup").html(correctMessage);
    $("#incorrectPopup").html(incorrectMessage);
    $("#scoreMessage").html(scoreMessage);
    $("#scorePopup").show();
}




// UTILS

// words which are too common, so won't be removed
var disallowedWords = ["the","and","that","these","there", "has", "had", "was","with"];
function isHideableWord(word) {
    if (word.length < 3) { // must be four letters or longer
        return false;
    }
    if (disallowedWords.includes( word.toLowerCase() )) {
        return false;
    }
    return true; // longer than 3 letters, and not disallowed, therefore it's valid
}

//generate a random integer between 'min' and 'max'
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// remove all spaces from a string
function removeSpaces(str) {
    return str.replace(/\s+/g,'');
}
