/**
 * Vertical timeline plugin for jQuery.
 */

// Wrapper to handle using with RequireJS or Browserify or as a global
(function(global, factory) {
  // Common JS (i.e. browserify) environment
  if (typeof module !== 'undefined' && module.exports && typeof require === 'function') {
    factory(require('jquery'), require('underscore'), require('tabletop'), require('isotope'), require('imagesloaded'), require('moment'));
  }
  // AMD?
  else if (typeof define === 'function' && define.amd) {
    define('jquery-vertical-timeline', ['jquery', 'underscore', 'tabletop', 'moment', 'isotope', 'imagesloaded'], factory);
  }
  // Browser global
  else if (global.jQuery && global._ && global.Tabletop && global.moment && global.jQuery.fn.isotope && global.jQuery.fn.imagesLoaded) {
    factory(global.jQuery, global._, global.Tabletop, global.moment, global.jQuery.fn.isotope, global.jQuery.fn.resize, global.jQuery.fn.imagesLoaded);
  }
  else {
    throw new Error('Could not find dependencies for jQuery Vertical Timeline.' );
  }
})(typeof window !== 'undefined' ? window : this, function($, _, Tabletop, moment) {

  /**
   * Default options
   */
  var defaultsOptions = {
    key: 'https://docs.google.com/spreadsheet/pub?key=0AsmHVq28GtVJdG1fX3dsQlZrY18zTVA2ZG8wTXdtNHc&output=html',
    sheetName: 'Posts',
    dateParse: ['MMM DD, YYYY', 'MM/DD/YYYY', 'M/D/YYYY', 'DD MMM YYYY'],
    defaultDirection: 'newest',
    defaultExpansion: 'expanded',
    groupFunction: 'groupSegmentByYear',
    sharing: false,
    gutterWidth: 57,
    width: 'auto',
    handleResize: false,
    tabletopOptions: {},
    columnMapping: {
      'title': 'title',
      'title_icon': 'title icon',
      'date': 'date',
      'display_date': 'display date',
      'photo_url': 'photo url',
      'caption': 'caption',
      'body': 'body',
      'read_more_url': 'read more url'
    },
    postTemplate: '<div class="item post <%= options.defaultExpansion %>" data-timestamp="<%= data.timestamp %>"> \
        <div class="inner"> \
          <div class="title"> \
            <h3> \
              <% if (data.title_icon) { %><img class="title-icon" src="<%= data.title_icon %>" \/><% } %> \
              <%= data.title %> \
            <\/h3> \
          <\/div> \
          <div class="date"><%= data.display_date %><\/div> \
          <div class="body"> \
            <% if (data.photo_url) { %> \
              <img src="<%= data.photo_url %>" alt=""> \
            <% } %> \
            <% if (data.caption) { %> \
              <div class="caption"><%= data.caption %><\/div> \
            <% } %> \
            <% if (data.body) { %>  \
              <div class="text"><%= data.body %><\/div> \
            <% } %> \
            <div class="clearfix"> \
              <% if (data.read_more_url) { %> \
                <a target="_blank" class="more" href="<%= data.read_more_url %>">Read more<\/a> \
              <% } %> \
            <\/div> \
          <\/div> \
          <a href="#" class="open-close"></a> \
        <\/div> \
      <\/div> \
    ',
    groupMarkerTemplate: '<div class="item group-marker item-group-<%= data.id %>" data-id="<%= data.id %>" data-timestamp="<%= data.timestamp %>"> \
        <div class="inner"> \
          <div class="inner2"> \
            <div class="group"><%= data.groupDisplay %><\/div> \
          <\/div> \
        <\/div> \
      <\/div> \
    ',
    buttonTemplate: '<div class="vertical-timeline-buttons clearfix"> \
        <div class="expand-collapse-buttons"> \
          <a class="expand-all <% if (data.defaultExpansion == "expanded") { %>active<% } %>" href="#"><span>Expand all<\/span><\/a> \
          <a class="collapse-all <% if (data.defaultExpansion == "collapsed") { %>active<% } %>" href="#"><span>Collapse all<\/span><\/a> \
        <\/div> \
        <div class="sort-buttons"> \
          <a class="sort-newest <% if (data.defaultDirection == "newest") { %>active<% } %>" href="#"><span>Newest first<\/span><\/a> \
          <a class="sort-oldest <% if (data.defaultDirection == "oldest") { %>active<% } %>" href="#"><span>Oldest first<\/span><\/a> \
        <\/div> \
      <\/div> \
    ',
    timelineTemplate: '<div class="vertical-timeline-timeline"> \
        <div class="line-container"> \
          <div class="line"><\/div> \
        <\/div> \
        <%= data.posts %> \
        <%= data.groups %> \
      <\/div> \
    ',
    loadingTemplate: '<div class="loading"> \
        Loading... \
      <\/div> \
    '
  };

  var groupingFunctions = {};
  /**
   * Grouping function by Decade.
   */
  groupingFunctions.groupSegmentByDecade = function(row, groups, direction) {
    var year = row.date.year();
    var yearStr = year.toString();
    var id = yearStr.slice(0, -1);
    var start = moment(id + '0-01-01T00:00:00');
    var end = moment(id + '9-12-31T12:59:99');

    if (_.isUndefined(groups[id])) {
      groups[id] = {
        id: id,
        groupDisplay: id + '0s',
        timestamp: (direction == 'newest') ? end.unix() : start.unix(),
        timestampStart: start.unix(),
        timestampEnd: end.unix()
      };
    }

    return groups;
  };

  /**
   * Grouping function by year.
   */
  groupingFunctions.groupSegmentByYear = function(row, groups, direction) {
    var year = row.date.year();
    var start = moment(year + '-01-01T00:00:00');
    var end = moment(year + '-12-31T12:59:99');

    if (_.isUndefined(groups[year.toString()])) {
      groups[year.toString()] = {
        id: year,
        groupDisplay: year,
        timestamp: (direction == 'newest') ? end.unix() : start.unix(),
        timestampStart: start.unix(),
        timestampEnd: end.unix()
      };
    }

    return groups;
  };

  /**
   * Grouping function by day.
   */
  groupingFunctions.groupSegmentByDay = function(row, groups, direction) {
    var month = new Date(row.timestamp).getMonth();
    var year = new Date(row.timestamp).getFullYear();
    var day = new Date(row.timestamp).getDate();
    var _month_str = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    var _time_start = Date.parse(_month_str[month] + ' ' + day + ', ' + year);
    var _time_end = Date.parse(_month_str[month] + ' ' + (day+1) + ', ' + year);
    var _id = day + (month + year * 100) * 100;

    groups[_id] = {
      id: _id,
      groupDisplay: _month_str[month] + ' ' + day + ', ' + year,
      timestamp: (direction == 'newest') ? _time_end: _time_start,
      timestampStart: _time_start,
      timestampEnd: _time_end
    };

    return groups;
  };



  /**
   * Base class for timeline
   */
  var VerticalTimeline = function(el, options) {
    this.options = $.extend(true, {}, defaultsOptions, options);

    // Check to see if grouping function is an option
    this.options.groupFunction = (!_.isFunction(this.options.groupFunction) && _.isFunction(groupingFunctions[this.options.groupFunction])) ? groupingFunctions[this.options.groupFunction] : this.options.groupFunction;

    // Consistent reference to jquery object
    this.$el = $(el);

    // Build templates for performance
    this.templates = {};
    this.templates.post = _.template(this.options.postTemplate);
    this.templates.group = _.template(this.options.groupMarkerTemplate);
    this.templates.buttons = _.template(this.options.buttonTemplate);
    this.templates.timeline = _.template(this.options.timelineTemplate);
    this.templates.loading = _.template(this.options.loadingTemplate);

    // Use custom events to make things happens
    this.loadEvents();
    this.$el.trigger('vt.build');
  };

  /**
   * Methods and properties of class
   */
  _.extend(VerticalTimeline.prototype, {
    // Events
    events: {
      'vt.build': ['buildLayout'],
      'vt.layoutBuilt': ['getData'],
      'vt.gotData': ['parseData'],
      'vt.parsedData': ['buildTimeline'],
      'vt.builtTimeline': ['loadImages', 'adjustWidth'],
      'vt.loadedImages': ['isotopeIt'],
      'vt.isotopized': ['adjustWidth', 'adjustSpine', 'domEvents']
    },

    // Event delegation
    loadEvents: function() {
      _.each(this.events, function(ea, ename) {
        _.each(ea, function(ehandler) {
          if (_.isFunction(this[ehandler])) {
            this.$el.on(ename, _.bind(this[ehandler], this));
          }
        }, this);
      }, this);
    },

    // Initial building
    buildLayout: function() {
      // Add base class for styling
      this.$el.addClass('vertical-timeline-container');

      // Add template layout
      this.$el.html(this.templates.buttons({
        data: this.options
      }) + this.templates.loading({}));

      // Get data
      this.$el.trigger('vt.layoutBuilt');
    },

    // Get data.  Data can be from from Google Spreadsheet or JSON
    getData: function() {
      var thisVT = this;

      // Check if data is set and has data
      if (_.isArray(this.options.data) && this.options.data.length > 0) {
        this.data = this.options.data;
        this.$el.trigger('vt.gotData');
      }
      else {
        Tabletop.init(_.extend({}, this.options.tabletopOptions, {
          key: this.options.key,
          wanted: [this.options.sheetName],
          callback: function(data, tabletop) {
            thisVT.data = data[thisVT.options.sheetName].elements;
            thisVT.tabletop = tabletop;
            thisVT.$el.trigger('vt.gotData');
          }
        }));
      }
    },

    // Process data
    parseData: function() {
      // Placeholder for groups
      this.groups = this.groups || {};

      // Go through each row
      this.data = _.map(this.data, function(row) {
        // Column mapping.  Tabletop removes spaces.
        _.each(this.options.columnMapping, function(column, key) {
          column = column.split(' ').join('');
          if (!_.isUndefined(row[column])) {
            row[key] = row[column];
          }
        });

        // Parse date with moment
        row.date = moment(row.date, this.options.dateParse);
        row.timestamp = row.date.unix();

        // Process into group
        this.groups = this.options.groupFunction(row, this.groups, this.options.defaultDirection);

        return row;
      }, this);

      // Trigger done
      this.$el.trigger('vt.parsedData');
    },

    // Build timline
    buildTimeline: function() {
      this.$el.append(this.templates.timeline({
        data: {
          posts: _.map(this.data, function(d, di) {
            return this.templates.post({
              data: d,
              options: this.options
            });
          }, this).join(' '),
          groups: _.map(this.groups, function(g, gi) {
            return this.templates.group({
              data: g
            });
          }, this).join(' ')
        }
      }));

      this.$timeline = this.$el.find('.vertical-timeline-timeline');
      this.$el.trigger('vt.builtTimeline');
    },

    // Wait for images to be loaded
    loadImages: function() {
      this.$el.imagesLoaded(_.bind(function() {
        this.$el.find('.loading').slideUp();
        this.$timeline.fadeIn('fast', _.bind(function() {
          this.$el.trigger('vt.loadedImages');
        }, this));
      }, this));
    },

    // Make isotope layout
    isotopeIt: function() {
      this.$el.find('.vertical-timeline-timeline').isotope({
        itemSelector: '.item',
        transformsEnabled: true,
        layoutMode: 'spineAlign',
        spineAlign:{
          gutterWidth: this.options.gutterWidth
        },
        getSortData: {
          timestamp: function($el) {
            return parseFloat($el.data('timestamp'));
          }
        },
        sortBy: 'timestamp',
        sortAscending: (this.options.defaultDirection === 'newest') ? false : true,
        itemPositionDataEnabled: true,
        onLayout: _.bind(function($els, instance) {
          this.$el.trigger('vt.isotopized');
        }, this),
        containerStyle: {
          position: 'relative'
        }
      });
    },

    // Adjust width of timeline
    adjustWidth: function() {
      var w = this.options.width;
      var containerW = this.$el.width();
      var timelineW;
      var postW;

      if (w === 'auto') {
        w = containerW + 'px';
      }

      // Set timeline width
      this.$timeline.css('width', w);
      timelineW = this.$timeline.width();

      // Set width on posts
      postW = (timelineW / 2) - (this.options.gutterWidth / 2) - 3;
      this.$timeline.find('.post').width(postW);
    },

    // Adjust the middle line
    adjustSpine: function() {
      var $lastItem = this.$el.find('.item.last');
      var itemPosition = $lastItem.data('isotope-item-position');
      var dateHeight = $lastItem.find('.date').height();
      var dateOffset = $lastItem.find('.date').position();
      var innerMargin = parseInt($lastItem.find('.inner').css('marginTop'), 10);
      var top = (dateOffset === undefined) ? 0 : parseInt(dateOffset.top, 10);
      var y = (itemPosition && itemPosition.y) ?
        parseInt(itemPosition.y, 10) : 0;
      var lineHeight = y + innerMargin + top + (dateHeight / 2);
      var $line = this.$el.find('.line');
      var xOffset = (this.$timeline.width() / 2) - ($line.width() / 2);

      $line.height(lineHeight)
        .css('left', xOffset + 'px');
    },

    // DOM event
    domEvents: function() {
      if (this.domEventsAdded) {
        this.$el.trigger('vt.domEventsAdded');
        return;
      }

      // Handle click of open close buttons on post
      this.$el.find('.item a.open-close').on('click', _.bind(function(e) {
        e.preventDefault();
        var $thisButton = $(e.currentTarget);
        var $post = $thisButton.parents('.post');
        var direction = ($post.hasClass('collapsed')) ? 'slideDown' : 'slideUp';

        // Slide body
        $thisButton.siblings('.body')[direction](_.bind(function() {
          // Mark post and poke isotope
          $post.toggleClass('collapsed').toggleClass('expanded');
          this.$timeline.isotope('reLayout');
        }, this));
        // Change top buttons
        this.$el.find('.expand-collapse-buttons a').removeClass('active');
      }, this));

      // Handle expand/collapse buttons
      this.$el.find('.vertical-timeline-buttons a.expand-all').on('click', _.bind(function(e) {
        e.preventDefault();
        var $this = $(e.currentTarget);
        var thisVT = this;

        this.$el.find('.post .body').slideDown(function() {
          thisVT.$timeline.isotope('reLayout');
        });
        this.$el.find('.post').removeClass('collapsed').addClass('expanded');
        this.$el.find('.expand-collapse-buttons a').removeClass('active');
        $this.addClass('active');
      }, this));
      this.$el.find('.vertical-timeline-buttons a.collapse-all').on('click', _.bind(function(e) {
        e.preventDefault();
        var $this = $(e.currentTarget);
        var thisVT = this;

        this.$el.find('.post .body').slideUp(function() {
          thisVT.$timeline.isotope('reLayout');
        });
        this.$el.find('.post').addClass('collapsed').removeClass('expanded');
        this.$el.find('.expand-collapse-buttons a').removeClass('active');
        $this.addClass('active');
      }, this));

      // Sorting buttons
      this.$el.find('.sort-buttons a').on('click', _.bind(function(e) {
        e.preventDefault();
        var $this = $(e.currentTarget);

        // Don't proceed if already selected
        if ($this.hasClass('active')) {
          return false;
        }

        // Mark buttons
        this.$el.find('.sort-buttons a').removeClass('active');
        $this.addClass('active');

        // Change sorting
        if ($this.hasClass('sort-newest')) {
          this.updateGroups('newest');
        }
        else {
          this.updateGroups('oldest');
        }
      }, this));

      // If jQuery resize plugin is enabled and the option is
      // enabled then handle resize
      if (this.options.handleResize === true && _.isFunction(this.$el.resize)) {
        this.$el.resize(_.throttle(_.bind(function() {
          this.$el.trigger('vt.isotopized');
        }, this), 200));
      }

      // Only need to add these once
      this.domEventsAdded = true;
      this.$el.trigger('vt.domEventsAdded');
    },

    // Updates group markers with the appropriate timestamp
    // for isotope layout
    updateGroups: function(direction) {
      var thisVT = this;
      direction = direction || this.options.defaultDirection;

      this.$el.find('.group-marker').each(function() {
        var $this = $(this);
        var timestamp = (direction !== 'newest') ?
          thisVT.groups[$this.data('id')].timestampStart :
          thisVT.groups[$this.data('id')].timestampEnd;
        $this.data('timestamp', timestamp);
      });

      // Poke isotope
      this.$timeline.isotope('reloadItems')
        .isotope({ sortAscending: (direction !== 'newest') });
    }
  });


  /**
   * Extend Isotope for custom layout: spineAlign
   */
  _.extend($.Isotope.prototype, {
    _spineAlignReset: function() {
      this.spineAlign = {
        colA: 0,
        colB: 0,
        lastY: -60
      };
    },

    _spineAlignLayout: function( $elems ) {
      var instance = this,
        props = this.spineAlign,
        gutterWidth = Math.round( this.options.spineAlign && this.options.spineAlign.gutterWidth ) || 0,
        centerX = Math.round(this.element.width() / 2);

      $elems.each(function(i, val) {
        var $this = $(this);
        var x, y;

        $this.removeClass('last').removeClass('top');
        if (i == $elems.length - 1) {
          $this.addClass('last');
        }
        if ($this.hasClass('group-marker')) {
          var width = $this.width();
          x = centerX - (width / 2);
          if (props.colA >= props.colB) {
            y = props.colA;
            if (y === 0) {
              $this.addClass('top');
            }
            props.colA += $this.outerHeight(true);
            props.colB = props.colA;
          }
          else {
            y = props.colB;
            if (y === 0) {
              $this.addClass('top');
            }
            props.colB += $this.outerHeight(true);
            props.colA = props.colB;
          }
        }
        else {
          $this.removeClass('left').removeClass('right');
          var isColA = props.colB >= props.colA;
          if (isColA) {
            $this.addClass('left');
          }
          else {
            $this.addClass('right');
          }

          x = isColA ?
            centerX - ( $this.outerWidth(true) + gutterWidth / 2 ) : // left side
            centerX + (gutterWidth / 2); // right side
          y = isColA ? props.colA : props.colB;
          if (y - props.lastY <= 60) {
            var extraSpacing = 60 - Math.abs(y - props.lastY);
            $this.find('.inner').css('marginTop', extraSpacing);
            props.lastY = y + extraSpacing;
          }
          else {
            $this.find('.inner').css('marginTop', 0);
            props.lastY = y;
          }
          props[( isColA ? 'colA' : 'colB' )] += $this.outerHeight(true);
        }
        instance._pushPosition( $this, x, y );
      });
    },

    _spineAlignGetContainerSize: function() {
      var size = {};
      size.height = this.spineAlign[( this.spineAlign.colB > this.spineAlign.colA ? 'colB' : 'colA' )];
      return size;
    },

    _spineAlignResizeChanged: function() {
      return true;
    }
  });

  /**
   * Turn verticalTimeline into jQuery plugin
   */
  $.fn.verticalTimeline = function(options) {
    return this.each(function() {
      if (!$.data(this, 'verticalTimeline')) {
        $.data(this, 'verticalTimeline', new VerticalTimeline(this, options));
      }
    });
  };

  // Incase someone wants to use the base class, return it
  return VerticalTimeline;

});
