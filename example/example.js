/**
 * JS for example using RequireJS
 */

require.config({
  shim: {
    'underscore': {
      exports: '_'
    },
    'handlebars': {
      exports: 'Handlebars'
    },
    'tabletop': {
      exports: 'Tabletop'
    },
    'isotope': {
      deps: ['jquery']
    },
    'jquery-resize': {
      deps: ['jquery']
    }
  },
  paths: {
    'jquery': '../bower_components/jquery/jquery.min',
    'underscore': '../bower_components/underscore/underscore-min',
    'tabletop': '../bower_components/tabletop/src/tabletop',
    'moment': '../bower_components/momentjs/min/moment.min',
    'isotope': '../bower_components/isotope/jquery.isotope.min',
    'jquery-resize': '../bower_components/jquery-resize/jquery.ba-resize.min',
    'eventEmitter/EventEmitter': '../bower_components/eventEmitter/EventEmitter.min',
    'eventie/eventie': '../bower_components/eventie/eventie',
    'imagesloaded': '../bower_components/imagesloaded/imagesloaded',
    'jquery-vertical-timeline': '../dist/jquery-vertical-timeline.min'
  }
});

require(['jquery', 'underscore', 'jquery-resize', 'jquery-vertical-timeline'], function($, _) {
  $(document).ready(function() {
    $('.timeline-jquery-example-mn-gambling').verticalTimeline({
      key: 'https://docs.google.com/spreadsheet/pub?key=0AtX8MXQ89fOKdDZadGcyNE9CZmFZV29tQjI5RFU3X3c&output=html',
      sheetName: 'timeline-data',
      dateParse: 'MMM DD, YYYY',
      defaultDirection: 'oldest',
      defaultExpansion: 'collapsed',
      groupFunction: 'groupSegmentByDecade',
      width: '50%',
      tabletopOptions: {
        parameterize: 'http://gs-proxy.herokuapp.com/proxy?url='
      }
    });

    $.getJSON('./example/example.json', function(data) {
      $('.timeline-jquery-example-kitten').verticalTimeline({
        data: data,
        dateParse: 'DD MMM YYYY',
        width: '75%'
      });
    });

    $('.timeline-jquery-example-mn-example').verticalTimeline({
      key: '0AjYft7IGrHzNdHVTTi1xRGtpdHV5SzJDZW4yRnlRN2c',
      sheetName: 'Entries',
      dateParse: 'M/D/YYYY',
      tabletopOptions: {
        parameterize: 'http://gs-proxy.herokuapp.com/proxy?url='
      }
    });
  });
});
