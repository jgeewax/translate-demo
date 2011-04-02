// Load the language API
google.load("language", "1");

function getLanguageName(lang) {
  lang = lang.toLowerCase();
  lang = lang.replace('_', ' ');
  lang = lang.replace(/^(.)|\s(.)/g, function($1) {
    return $1.toUpperCase();
  });
  return lang;
}

function getResultTemplate(language, translation) {
  var langCode = google.language.Languages[language];
  var $template = $("#result-template").clone();
  $template.show();
  $template.attr('id', 'result-' + langCode);
  $template.find('.result-language').text(getLanguageName(language));
  $template.find('.result-translation').text(translation || 'Loading...');
  $template.find('.result-translation').attr('id', 'translation-' + langCode);
  return $template;
}

function getLanguageTemplate(language) {
  var langCode = google.language.Languages[language];
  var $template = $("#language-template").clone();
  $template.show();
  $template.attr('id', 'lang-' + langCode);
  $template.find('.language-name').text(getLanguageName(language));
  $template.find('.language-name').attr('href', '#result-' + langCode);
  return $template;
}

function populateLanguages() {
  $("#languages").find(':visible').remove();
  
  for (var language in google.language.Languages) {
    if (language != 'UNKNOWN') {
      $("#languages").append(getLanguageTemplate(language));
    }
  }
}

$(document).ready(function() {
  $('a.language-name').click(function() {
    console.log($(this).attr('href'));
    $('#' + $(this).attr('href')).css("background-color", "#ffd");
    return true;
  });
  
  $("form#compare").submit(function() {
    // Populate the list of languages
    populateLanguages();
    
    // Get the basic stuff
    var word = $("#word").val();
    var $container = $("#results-container");
    var languages = google.language.Languages;
    
    // Remove all existing rows and start fresh.
    $container.find(':visible').remove();
    
    // Go through all available languages and try 
    for (var langName in languages) {
      var langCode = languages[langName];
      if (langCode == '') continue;
      
      function getCallback(langCode) {
        return function(result) {
          if (result.translation) {
            $("#translation-" + langCode).text(result.translation);
            $("#lang-" + langCode).css('font-weight', 'bold');
          }
          else {
            $('#result-' + langCode).remove();
            $("#lang-" + langCode)
              .css('font-style', 'italic')
              .detach()
              .appendTo("#languages")
            ;
          }
        };
      }
      
      // Pop the result template into the list
      $container.append(getResultTemplate(langName));
      // Kick off the API request which will fill in the blanks.
      google.language.translate(word, '', langCode, getCallback(langCode));
    }
    
    // So that the form doesn't actually submit anything...
    return false;
  });
});
