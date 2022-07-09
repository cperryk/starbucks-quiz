
//<![CDATA[
$(function () {
  //L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
  var city_lat_lons = [
    { name: 'Washington D.C.', lat: 38.89904904367508, lon: -77.03750610351562, zoom: 12 },
    { name: 'New York', lat: 40.683241578458706, lon: -73.93730163574219, zoom: 11 },
    { name: 'San Francisco', lat: 37.76827222674256, lon: -122.43610382080078, zoom: 12 },
    { name: 'Chicago', lat: 41.83887416186901, lon: -87.66952514648438, zoom: 10 },
    { name: 'Miami', lat: 25.787676, lon: -80.224145, zoom: 11 },
    { name: 'Los Angeles', lat: 34.03843568373248, lon: -118.28773498535156, zoom: 11 },
    { name: 'Houston', lat: 29.762778, lon: -95.383056, zoom: 10 },
    { name: 'Seattle', lat: 47.609722, lon: -122.333056, zoom: 10 },
    { name: 'Las Vegas', lat: 36.11402608757969, lon: -115.17173767089842, zoom: 11 },
    //{name:'San Diego',lat:32.73992711707743,lon:-117.16094970703125,zoom:10},
    { name: 'London', lat: 51.507222, lon: -0.1275, zoom: 11 },
    { name: 'Paris', lat: 48.8567, lon: 2.3508, zoom: 12 },
    { name: 'Shanghai', lat: 31.2, lon: 121.5, zoom: 11 },
    { name: 'Seoul', lat: 37.51735099503349, lon: 127.01431274414062, zoom: 11 },
    //{name:'Mexico City',lat:19.433333,lon:-99.133333,zoom:11},
    { name: 'Toronto', lat: 43.7, lon: -79.4, zoom: 11 },
    { name: 'Honolulu', lat: 21.3, lon: -157.816667, zoom: 11 },
    { name: 'Barcelona', lat: 41.410805789669816, lon: 2.1787261962890625, zoom: 12 },
    { name: 'Singapore', lat: 1.3305993740875375, lon: 103.83316040039062, zoom: 11 },
    //{name:'Buenos Aires',lat:-34.59605236996628,lon:-58.429756164550774,zoom:13},
    { name: 'Anchorage', lat: 61.16576172820577, lon: -149.83360290527344, zoom: 11 },
    { name: 'Moscow', lat: 55.73484280305742, lon: 37.615814208984375, zoom: 11 },
    { name: 'Portland', lat: 45.50201573698665, lon: -122.67745971679688, zoom: 11 }
  ];
  var answers = ['Seoul', 'Portland', 'Barcelona', 'Singapore', 'Buenos Aires', 'Anchorage', 'London', 'Paris', 'Shanghai', 'Moscow', 'Mexico City', 'Cairo', 'Seattle', 'Washington D.C.', 'New York', 'San Francisco', 'Chicago', 'Houston', 'Phoenix', 'Miami', 'Philadelphia', 'Pittsburgh', 'Baltimore', 'Boston', 'Las Vegas', 'Detroit', 'Honolulu', 'Dallas', 'Columbus', 'Toronto'];
  var user_score = 0;
  var average_score = '';
  $('#btn_fb_share').click(function () {
    facebookShare();
  });
  $('#btn_tw_share').click(function () {
    twitterShare();
  });
  function Interactive() {
    this.nav = new QuizNav(this);
    this.questions = city_lat_lons.slice(0);
    this.randomizeQuestions();
    this.randomizeAnswers();
    this.btn_next = $('#next_btn');
    this.currentLocation = 0;
    var self = this;
    this.makeLeafletMap('map_container', 'https://api.mapbox.com/styles/v1/cperryk/ckxjtt1542e4z14ucgonwii04/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiY3BlcnJ5ayIsImEiOiJja3hqdG1kZzYweHhmMzFxdzM3NnBrNG5pIn0.SW_C8MZfthNo6lLgkHqsFA', function () {
      self.goToLocation(0);
    });
  }
  Interactive.prototype.randomizeQuestions = function () {
    var arr = this.questions.slice(0);
    scrambleArray(arr);
    this.questions = arr;
  };
  Interactive.prototype.randomizeAnswers = function () {
    var answers_remaining = answers.slice(0);
    for (var i = 0; i < this.questions.length; i++) {
      this.questions[i].answers = [];
      var answers_available = answers_remaining.slice(0);
      scrambleArray(answers_available);
      for (var a = 0; a < answers_available.length; a++) {
        if (answers_available[a] !== this.questions[i].name) {
          this.questions[i].answers.push({ name: answers_available[a], correct: false });
        }
        if (this.questions[i].answers.length == 3) {
          break;
        }
      }
      this.questions[i].answers.push({ name: this.questions[i].name, correct: true });
      this.questions[i].correct_answer = this.questions[i].name;
      scrambleArray(this.questions[i].answers);
      answers_remaining.splice(answers_remaining.indexOf(this.questions[i].name), 1);
    }
  };
  Interactive.prototype.resetHTML = function () {
    $('.leaflet-control-container').show();
    $('#quiz_UI')
      .css('bottom', -40);
    $('.answer_choice').remove();
    $('.answer_feedback').hide();
    $('#btn_next')
      .hide()
      .unbind('click');
    return this;
  };
  Interactive.prototype.goToLocation = function (location_index) {
    var self = this;
    $('#map_container').fadeOut(300, function () {
      $('#map_attribution').hide();
      if (self.currentLocation == self.questions.length) {
        $('#quiz_end').hide();
      }
      if (location_index == self.questions.length) {
        if (self.endLoaded) {
          $('#quiz_end').show();
        }
        else {
          self.loadEnd();
        }
      }
      else {
        self.loadQuestion(location_index);
      }
      self.currentLocation = location_index;
      $('#map_container').fadeIn(300);
    });
  };
  Interactive.prototype.loadEnd = function () {
    this.endLoaded = true;
    $('.leaflet-control-container').hide();
    $('#quiz_UI').hide();
    $('#quiz_end').show();
    $('#final_score_here').html(user_score);
    $('.question_count_here').html(this.questions.length);
    this.nav.updateLocation(this.questions.length);
    if (!this.average_score) {
      this.loadScore();
    }
    if (!this.score_sent) {
      this.sendScore();
    }
    $('#your_rank_here').html(getRank(user_score));
  };
  Interactive.prototype.loadScore = function () {
    var self = this;
    $.ajax({
      dataType: 'jsonp',
      url: 'http://slate-interactive3-prod.elasticbeanstalk.com/scores/getScores.php?interactiveID=starbucks1&callback=?',
      success: function (data) {
        $('#average_score_here')
          .html(data.average)
          .addClass('loaded');
        self.average_score = data.average;
      },
      error: function () {
        $('#average_score_here').html('Could not load; please check back later');
      }
    });
  };
  Interactive.prototype.sendScore = function () {
    var self = this;
    var url = 'http://slate-interactive3-prod.elasticbeanstalk.com/scores/addScore.php?interactiveID=starbucks1&score=' + user_score + '&callback=?';
    $.ajax({
      dataType: 'jsonp',
      url: url,
      success: function (data) {
        self.score_sent = true;
      }
    });
  };
  Interactive.prototype.loadQuestion = function (question_index) {
    var question = this.questions[question_index];
    this
      .resetHTML()
      .setLocationOnMap(question.name)
      .printAnswers(question)
      .nav
      .updateLocation(question_index);
    if (question.isAnswered) {
      this.reveal(this.questions[question_index]);
    }
  };
  Interactive.prototype.printAnswers = function (question) {
    var answers = question.answers;
    var l = answers.length;
    for (var i = 0; i < l; i++) {
      new AnswerInstance(answers[i], question, this);
    }
    return this;
  };
  function AnswerInstance(answer_data, question, parent) {
    var self = this;
    this.par = parent;
    this.question = question;
    this.obj = $('<div class="answer_choice">').html(answer_data.name);
    if (this.question.isAnswered) {
      if (answer_data.clicked) {
        this.obj.addClass('clicked');
      }
    }
    else {
      this.obj
        .addClass('active')
        .click(answerClicked);
    }
    this.obj.appendTo('#answer_choices');
    function answerClicked() {
      question.isAnswered = true;
      question.selected_answer = $(this).html();
      self.obj.addClass('clicked');
      self.par.reveal(question);
      self.par.removeClickListeners();
      if (question.correct_answer == question.selected_answer) {
        user_score += 1;
        $('#correct_here').html(user_score);
      }
    }
  }
  Interactive.prototype.removeClickListeners = function () {
    $('.answer_choice')
      .removeClass('active')
      .unbind('click');
  };
  Interactive.prototype.reveal = function (question) {
    var self = this;
    showNextBtn();
    this.revealAnswerOnMap();
    setCorrectIncorrect(question);
    raiseUI();
    function setCorrectIncorrect(question) {
      if (question.selected_answer == question.correct_answer) {
        answerCorrect();
      }
      else {
        answerIncorrect();
      }
    }
    function raiseUI() {
      $('#quiz_UI')
        .show()
        .animate({ 'bottom': 0 }, 300, function () {
          self.nav.activate(self.nav.btn_next);
        });
    }
    function answerCorrect() {
      $('#answer_correct')
        .html('<strong>Correct!</strong> The answer is <strong>' + question.correct_answer + '</strong>' + (question.correct_answer[question.correct_answer.length - 1] == '.' ? '' : '.'))
        .show();
    }
    function answerIncorrect() {
      $('#answer_incorrect')
        .html('<strong>Incorrect</strong>. The correct answer is <strong>' + question.correct_answer + '</strong>' + (question.correct_answer[question.correct_answer.length - 1] == '.' ? '' : '.'))
        .show();
    }
    function showNextBtn() {
      $('#btn_next')
        .fadeIn()
        .unbind('click')
        .click(function () {
          self.goToLocation(self.currentLocation + 1);
        });
    }
  };
  Interactive.prototype.revealAnswerOnMap = function () {
    $('#map_attribution').fadeIn();
    this.tileLayer.addTo(this.m);
  };
  Interactive.prototype.makeLeafletMap = function (container, url, callback) {
    var self = this;
    self.m = new L.Map(container, {
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: false,
      minZoom: 9,
      doubleClickZoom: false
    })
      /*
      .on('moveend',function(){
          console.log(this.getCenter());
      })*/
      .addControl(new L.Control.Zoom({ position: 'topright' }))
      .setView(new L.LatLng(18.1, -15.95), 3);

    self.tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/cperryk/ckxjtt1542e4z14ucgonwii04/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiY3BlcnJ5ayIsImEiOiJja3hqdG1kZzYweHhmMzFxdzM3NnBrNG5pIn0.SW_C8MZfthNo6lLgkHqsFA').addTo(self.m);
    if (callback) { callback(); }
  };
  Interactive.prototype.setLocationOnMap = function (city) {
    var self = this;
    resetMap();
    printMarkers();
    setView();
    return this;
    function resetMap() {
      if (self.markers) {
        self.m.removeLayer(self.markers);
      }
      if (self.m.hasLayer(self.tileLayer)) {
        self.m.removeLayer(self.tileLayer);
      }
    }
    function printMarkers() {
      var stores = window.starbucksLocations[city];
      self.markers = new L.layerGroup();
      for (var i = 0; i < stores.length; i++) {
        var lat = stores[i][0];
        var lon = stores[i][1];
        var marker = new L.circleMarker([lat, lon], { 'opacity': 1, 'fillOpacity': 0.8, 'fillColor': '#026445', 'weight': 1, 'color': 'white' });
        marker.setRadius(5);
        self.markers.addLayer(marker);
      }
      self.markers.addTo(self.m);
    }
    function setView() {
      var latlons;
      for (var a = 0; a < city_lat_lons.length; a++) {
        if (city_lat_lons[a].name == city) {
          self.m.setView([city_lat_lons[a].lat, city_lat_lons[a].lon], city_lat_lons[a].zoom);
          break;
        }
      }
    }
  };
  function QuizNav(parent) {
    this.par = parent;
    this.obj = $('#quiz_nav');
    this.btn_back = $('#btn_left');
    this.btn_next = $('#btn_right');
    this.location_readout = $('#location_readout');
    this.addEventListeners();
  }
  QuizNav.prototype.addEventListeners = function () {
    this.btn_back.click(function () {
      if (!$(this).hasClass('inactive')) {
        goBackOne();
      }
    });
    this.btn_next.click(function () {
      if (!$(this).hasClass('inactive')) {
        goForwardOne();
      }
    });
    var self = this;
    function goBackOne() {
      self.par.goToLocation(self.par.currentLocation - 1);
    }
    function goForwardOne() {
      self.par.goToLocation(self.par.currentLocation + 1);
    }
  };
  QuizNav.prototype.updateLocation = function (location_index) {
    if (location_index < this.par.questions.length) {
      this.location_readout.html('Map ' + (location_index + 1) + ' of ' + this.par.questions.length);
      if (location_index === 0) {
        this.deactivate(this.btn_back);
      }
      else {
        this.activate(this.btn_back);
      }
      if (this.par.questions[location_index + 1] !== undefined && this.par.questions[location_index + 1].isAnswered) {
        this.activate(this.btn_next);
      }
      else {
        this.deactivate(this.btn_next);
      }
    }
    else {
      this.location_readout.html('End');
      this.deactivate(this.btn_next);
      this.activate(this.btn_back);
    }
  };
  QuizNav.prototype.activate = function (btn) {
    btn.removeClass('inactive');
  };
  QuizNav.prototype.deactivate = function (btn) {
    btn.addClass('inactive');
  };
  var myinteractive = new Interactive();
  function twitterShare() {
    var shareText = 'I ranked "' + getRank(user_score) + '" on @Slate\'s Starbucks quiz. Can you name a city just by its Starbucks locations?';
    var width = 575,
      height = 400,
      left = ($(window).width() - width) / 2,
      top = ($(window).height() - height) / 2,
      opts = 'status=1' +
        ',width=' + width +
        ',height=' + height +
        ',top=' + top +
        ',left=' + left;
    var URL = 'http://twitter.com/intent/tweet?' + '&text=' + shareText + '&url=' + encodeURI(getURL());
    window.open(URL, 'twitter', opts);
  }
  function facebookShare() {
    var obj = {
      method: 'feed',
      link: getURL(),
      picture: 'http://slate.com/content/dam/slate/articles/news_and_politics/map_of_the_week/2013/06/130723_motw_starbucks.png',
      name: 'I ranked "' + getRank(user_score) + '" on Slate\'s Starbucks quiz.',
      caption: 'Can you name a city just by looking at a map of its Starbucks locations?',
      description: "A horrifying journey across the globe."
    };
    function callback(response) {
      document.getElementById('msg').innerHTML = "Post ID: " + response['post_id'];
    }
    FB.ui(obj, callback);
  }
  function getURL() {
    var url = $(location).attr('href').indexOf('?') > -1 ? $(location).attr('href').substring(0, $(location).attr('href').indexOf('?')) : $(location).attr('href');
    return url;
  }
});

function getRank(score) {
  if (score >= 17) {
    return 'Trenta';
  }
  else if (score >= 13) {
    return 'Venti';
  }
  else if (score >= 9) {
    return 'Grande';
  }
  else if (score >= 5) {
    return 'Tall';
  }
  else if (score >= 1) {
    return 'Short';
  }
  else {
    return 'Demi';
  }
}
function scrambleArray(myArray) {
  var i = myArray.length,
    j, tempi, tempj;
  if (i === 0) return false;
  while (--i) {
    j = Math.floor(Math.random() * (i + 1));
    tempi = myArray[i];
    tempj = myArray[j];
    myArray[i] = tempj;
    myArray[j] = tempi;
  }
}


if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (obj, start) {
    for (var i = (start || 0), j = this.length; i < j; i++) {
      if (this[i] === obj) { return i; }
    }
    return -1;
  };
}            //]]>
