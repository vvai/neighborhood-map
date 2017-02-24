var FOURSQUARE_CLIENT_ID = 'GK23ORA03LZELZANM5AYXSNKNASB5FV3CEGD2HCFE0CRX5YD';
var FOURSQUARE_CLIENT_SECRET= 'H2ASYPJ5E4VU4X1BQK4KO3YKH01MGLZLQQUX00A3OULZPUZZ';
var coordinates = {lat: 52.08794, lng: 23.6823};
var alertMessage = 'Ooops! Something went wrong :( \n Please reload page';

function initMap() {
  ko.applyBindings(new BrestCafesViewModel());
}

function mapError() {
  alert(alertMessage);
}

function BrestCafesViewModel() {
  var self = this;
  self.filter = ko.observable('');
  self.filteredCafes = ko.observableArray();
  self.map = initMap();
  self.hideSidebar = ko.observable(false);
  self.InfoWindow = new google.maps.InfoWindow({
    content: ''
  });
  getCafesList(coordinates).then(function(data) {
    self.allCafes = data.response.groups[0].items.map(initFoursquareMarker);
    self.filteredCafes(self.allCafes);
  });

  this.filter.subscribe(function () {
    self.allCafes.forEach(function(cafe) {
      if (cafe.name.toLowerCase().indexOf(self.filter().toLowerCase()) < 0) {
        cafe.show(false);
        cafe.marker.setVisible(false);
      } else {
        cafe.show(true);
        cafe.marker.setVisible(true);
      }
    });
  });

  this.toggleSidebar = function() {
    self.hideSidebar(!self.hideSidebar());
  };

  this.showInfo = function(cafe) {
    self.InfoWindow.setContent(generateInfoWindow(cafe.elem.venue));
    // var iw = new google.maps.InfoWindow({
    //   content: generateInfoWindow(cafe.elem.venue)
    // });
    self.InfoWindow.open(self.map, cafe.marker);
    animateMarker(cafe.marker);
  };

  function initMap() {
    return new google.maps.Map(document.getElementById('map'), {
      center: coordinates,
      zoom: 15
    });
  }

  function getCafesList(coordinates) {
    var foursquareRequestUrl = 'https://api.foursquare.com/v2/venues/explore/' + '?ll=' + coordinates.lat + ',' + coordinates.lng + '&venuePhotos=1&section=coffee&client_id=' + FOURSQUARE_CLIENT_ID + '&client_secret=' + FOURSQUARE_CLIENT_SECRET + '&v=20131124';
    return $.get(foursquareRequestUrl).fail(function() {
        alert(alertMessage);
      });
  }

  function animateMarker(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 1400);
  }

  function initFoursquareMarker(elem) {
    var cord = {lat: elem.venue.location.lat, lng: elem.venue.location.lng};
    var marker = new google.maps.Marker({
      position: cord,
      map: self.map
    });
    marker.addListener('click', function (e) {
          animateMarker(marker);
    });
    marker.addListener('click', function() {
      self.InfoWindow.setContent(generateInfoWindow(elem.venue));
      self.InfoWindow.open(self.map, marker);
      animateMarker(marker);
    });
    return { marker: marker, elem: elem, name: elem.venue.name, show: ko.observable(true) };
  }

  function generateInfoWindow(venue) {
    var featuredPhoto = venue.photos.groups[0].items[0];
    var imgSrc = featuredPhoto.prefix + '300x300' +  featuredPhoto.suffix;
    var adress = venue.location.formattedAddress[0];
    var rating = venue.rating || 'no rating';
    return '<div class="cafe-info"><h3>' + venue.name + '</h3><img class="cafe-info__image" src="' +
      imgSrc + '" alt="'+ venue.name + '"><p>Adress: ' + adress + '</p><p>Rating: ' + rating + '</p>' +
      '<p class="cafe-info__foursquare">Power by Foursquare API</div>';
  }

}
