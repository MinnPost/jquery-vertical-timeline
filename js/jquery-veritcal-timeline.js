/**
 * Vertical timeline plugin for jQuery.  Data powered
 * by Google Docs.
 *
 * Sharing is using old APIs and breaks in some browsers.
 */
(function($, w, undefined) {
  $.fn.verticalTimeline = function(options) {
    /**
     * Configuration for timeline.  defaultDirection should be
     * "newest" or "oldest".  groupFunction is a function
     * to handle grouping.
     */
    var defaults = {
      key: 'https://docs.google.com/spreadsheet/pub?key=0AsmHVq28GtVJdG1fX3dsQlZrY18zTVA2ZG8wTXdtNHc&output=html',
      sheetName: 'Posts',
      defaultDirection: 'newest',
      defaultExpansion: 'expanded',
      groupFunction: 'groupSegmentByYear',
      sharing: false,
      gutterWidth: 56,
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
        'read_more_url': 'read more url',
        'title': 'title'
      },
      postTemplate: ' \
        <div class="item post"> \
          <div class="inner"> \
            <div class="timestamp">{{timestamp}}</div> \
            <div class="title"> \
                <h3> \
                {{#if title_icon}}<img class="title-icon" src="{{title_icon}}" />{{/if}} \
                {{title}} \
                </h3> \
            </div> \
            <div class="date">{{display_date}}</div> \
            <div class="body"> \
              {{#if photo_url}} \
                <img src="{{photo_url}}" alt=""> \
              {{/if}} \
              {{#if caption}} \
                <div class="caption">({{caption}})</div> \
              {{/if}} \
              {{#if body}} \
                <div class="text">{{{body}}}</div> \
              {{/if}} \
              <div class="clearfix"> \
                {{#if read_more_url}} \
                  <a target="_blank" class="more" href="{{read_more_url}}">READ MORE</a> \
                  {{#if sharing}} \
                    <div class="share"> \
                      <a href="#" class="share-trigger"></a> \
                      <div class="share-popup"> \
                        <a href="https://twitter.com/share" class="twitter-share-button" data-url="{{read_more_url}}" data-text="{{title}}" data-count="none">Tweet</a> \
                        <a class="facebook-share-button" name="fb_share" type="button" share_url="{{read_more_url}}">Share</a> \
                      </div> \
                    </div> \
                  {{/if}} \
                {{/if}} \
              </div> \
            </div> \
          </div> \
        </div> \
      ',
      groupMarkerTemplate: ' \
        <div class="item group-marker item-group-{{id}}" data-id="{{id}}"> \
          <div class="inner"> \
            <div class="inner2"> \
              <div class="timestamp">{{timestamp}}</div> \
              <div class="group">{{groupDisplay}}</div> \
            </div> \
          </div> \
        </div> \
      ',
      buttonTemplate: ' \
        <div class="vertical-timeline-buttons"> \
          <div class="expand-collapse-buttons"> \
            <a class="expand-all active" href="#"><span>Expand all</span></a> \
            <a class="collapse-all" href="#"><span>Collapse all</span></a> \
          </div> \
          <div class="sort-buttons"> \
            <a class="sort-newest active" href="#"><span>Newest first</span></a> \
            <a class="sort-oldest" href="#"><span>Oldest first</span></a> \
          </div> \
        </div> \
      ',
      timelineTemplate: ' \
        <div class="vertical-timeline-timeline"> \
          <div class="line-container"> \
            <div class="line"></div> \
          </div> \
        </div> \
      '
    };
    
    /**
     * Grouping function by Decade.
     */
    var groupSegmentByDecade = function(segment, groups, direction) {
      // Grouping by decade
      var year = new Date(segment.timestamp).getFullYear();
      var yearStr = year.toString();
      var id = yearStr.slice(0, -1);
      
      groups[id] = {
        id: id,
        groupDisplay: id + '0\'s',
        timestamp: (direction == 'newest') ? 
          Date.parse('December 31, ' + id + '9') :
          Date.parse('January 1, ' + id + '0'),
        timestampStart: Date.parse('January 1, ' + id + '0'),
        timestampEnd: Date.parse('December 31, ' + id + '9')
      };
      
      return groups;
    };
    
    /**
     * Grouping function by year.
     */
    var groupSegmentByYear = function(segment, groups, direction) {
      // Grouping by decade
      var year = new Date(segment.timestamp).getFullYear();
      
      groups[year] = {
        id: year,
        groupDisplay: year,
        timestamp: (direction == 'newest') ? 
          Date.parse('December 31, ' + year) :
          Date.parse('January 1, ' + year),
        timestampStart: Date.parse('January 1, ' + year),
        timestampEnd: Date.parse('December 31, ' + year)
      };
      
      return groups;
    };
  
    // Mix defaults with options.
    var timelineConfig = $.extend(defaults, options);
    
    // As a niceity, if the group function is a string referring
    // to group function, then use that.
    timelineConfig.groupFunction = (timelineConfig.groupFunction === 'groupSegmentByYear') ?
      groupSegmentByYear : timelineConfig.groupFunction;
    timelineConfig.groupFunction = (timelineConfig.groupFunction === 'groupSegmentByDecade') ?
      groupSegmentByDecade : timelineConfig.groupFunction;
   
    // Go through each jquery object
    return this.each(function() {  
      var $thisObj = $(this);
      var groups = {};
      var verticalTimeline = {};
      
      // Add class to mark as processed
      $thisObj.addClass('vertical-timeline-container');
      
      // Add in extra markup
      $thisObj.html(timelineConfig.buttonTemplate + 
        timelineConfig.timelineTemplate);
      
      /**
       * Handle data loaded in from Tabletop or directly, then render.
       */
      verticalTimeline.setupTimeline = function(data, tabletop) {
        var postTemplate  = Handlebars.compile(timelineConfig.postTemplate);
        var groupMarkerTemplate  = Handlebars.compile(timelineConfig.groupMarkerTemplate);

        // Check for data
        if (tabletop) {
          data = tabletop.sheets(timelineConfig.sheetName).all();
        }

        // Go through data from the sheet.
        $.each(data, function(i, val) {
          // Create groups (by year or whatever)
          groups = timelineConfig.groupFunction(val, groups, timelineConfig.defaultDirection);
    
          // Add any other data
          val.sharing = timelineConfig.sharing;
          // Add output to timeline
          $thisObj.find('.vertical-timeline-timeline').append(postTemplate(val));
        });
  
        // Add a group marker for each group
        $.each(groups, function(i, group) {
          $thisObj.find('.vertical-timeline-timeline').append(groupMarkerTemplate(group));
        });
        
        verticalTimeline.handleSharing();
        verticalTimeline.handleExpanding();
        verticalTimeline.handleSorting();
        verticalTimeline.adjustWidth();
        verticalTimeline.handleResizing();
    
        // Start rendering isotope goodness when images are loaded.
        $thisObj.find('.vertical-timeline-timeline').imagesLoaded(function() {
          $thisObj.find('.vertical-timeline-timeline').isotope({
            itemSelector : '.item',
            transformsEnabled: true,
            layoutMode: 'spineAlign',
            spineAlign:{
              gutterWidth: timelineConfig.gutterWidth
            },
            getSortData: {
              timestamp: function($elem) {
                return parseFloat($elem.find('.timestamp').text());
              }
            },
            sortBy: 'timestamp',
            sortAscending: (timelineConfig.defaultDirection == 'newest') ? false : true,
            itemPositionDataEnabled: true,
            onLayout: function($elems, instance) {
              verticalTimeline.adjustLine();
            }
          });
        });
      };
      
      /**
       * Handle sharing.
       */
      verticalTimeline.handleSharing = function() {
        // load scripts after all the html has been set
        if (timelineConfig.sharing) {
          $.getScript('//static.ak.fbcdn.net/connect.php/js/FB.Share');
          $.getScript('//platform.twitter.com/widgets.js');
    
          $thisObj.find('.vertical-timeline-timeline .post .share').hover(
            function() {
              $(this).find('.share-trigger').addClass('over');
              $(this).find('.share-popup').show();
            },
            function() {
              $(this).find('.share-trigger').removeClass('over');
              $(this).find('.share-popup').hide();
            }
          );
        }
      };
      
      /**
       * Handle post expanding/collapsing.
       */
      verticalTimeline.handleExpanding = function() {
        // Add open/close buttons to each post
        $thisObj.find('.vertical-timeline-timeline .item.post').each(function() {
          $(this).find('.inner').append('<a href="#" class="open-close"></a>');
        });
        
        // Handle default state
        if (timelineConfig.defaultExpansion != 'expanded') {
          $thisObj.find('.vertical-timeline-timeline .item').each(function() {
            var $this = $(this);
            $this.find('.body').hide();
            $this.find('.post').toggleClass('closed');
          });
          
          $thisObj.find('.expand-collapse-buttons a').removeClass('active');
          $thisObj.find('.expand-collapse-buttons a.collapse-all').addClass('active');
        };

        // Handle click of individual buttons.
        $thisObj.find('.vertical-timeline-timeline .item a.open-close').click(function(e) {
          $(this).siblings('.body').slideToggle(function() {
            $thisObj.find('.vertical-timeline-timeline').isotope('reLayout');
          });
          $(this).parents('.post').toggleClass('closed');
          $thisObj.find('.expand-collapse-buttons a').removeClass('active');
          e.preventDefault();
        });
    
        $thisObj.find('.vertical-timeline-buttons a.expand-all').click(function(e) {
          $thisObj.find('.post .body').slideDown(function() {
            $thisObj.find('.vertical-timeline-timeline').isotope('reLayout');
          });
          $thisObj.find('.post').removeClass('closed');
          $thisObj.find('.expand-collapse-buttons a').removeClass('active');
          $(this).addClass('active');
          e.preventDefault();
        });
    
        $thisObj.find('.vertical-timeline-buttons a.collapse-all').click(function(e) {
          $thisObj.find('.post .body').slideUp(function() {
            $thisObj.find('.vertical-timeline-timeline').isotope('reLayout');
          });
          $thisObj.find('.post').addClass('closed');
          $thisObj.find('.expand-collapse-buttons a').removeClass('active');
          $(this).addClass('active');
          e.preventDefault();
        });
      };
      
      /**
       * Handle sorting.
       */
      verticalTimeline.handleSorting = function() {
        // Handle default sort direction
        if (timelineConfig.defaultDirection != 'newest') {
          $thisObj.find('.sort-buttons a').removeClass('active');
          $thisObj.find('.sort-buttons a.sort-oldest').addClass('active');
        }
        
        // Handle buttons
        $thisObj.find('.sort-buttons a').click(function(e) {
          var $this = $(this);
          // don't proceed if already selected
          if ($this.hasClass('active')) {
            return false;
          }
      
          $thisObj.find('.sort-buttons a').removeClass('active');
          $this.addClass('active');
          if ($this.hasClass('sort-newest')) {
            verticalTimeline.updateGroupMarkers(false);
            $thisObj.find('.vertical-timeline-timeline').isotope('reloadItems')
              .isotope({sortAscending: false});
          }
          else {
            verticalTimeline.updateGroupMarkers(true);
            $thisObj.find('.vertical-timeline-timeline').isotope('reloadItems')
              .isotope({sortAscending: true});
          }
          e.preventDefault();
        });
      };
      
      /**
       * Handle resize.  Uses "jQuery resize event" plugin
       */
      verticalTimeline.handleResizing = function() {
        if (timelineConfig.handleResize === true) {
          $thisObj.resize(function() {
            verticalTimeline.adjustWidth();
            verticalTimeline.adjustLine();
          });
        }
      };
      
      /**
       * Update group markers as they are an interval.
       */
      verticalTimeline.updateGroupMarkers = function(direction) {
        $thisObj.find('.group-marker').each(function() {
          var $this = $(this);
          var id = $this.attr('data-id');
          var timestamp = (direction) ? 
            groups[id].timestampStart : groups[id].timestampEnd;
          
          $this.find('.timestamp').text(timestamp);
        });
      };
      
      /**
       * Adjust width.
       */
      verticalTimeline.adjustWidth = function() {
        var w = timelineConfig.width;
        var containerW = $thisObj.width();
        var timelineW;
        var postW;

        if (timelineConfig.width === 'auto') {
          w = containerW + 'px';
        }
        
        // Set timeline width
        $thisObj.find('.vertical-timeline-timeline').width(w);
        timelineW = $thisObj.find('.vertical-timeline-timeline').width();
        
        // Set width on posts
        postW = (timelineW / 2) - (timelineConfig.gutterWidth / 2) - 4;
        $thisObj.find('.vertical-timeline-timeline .post').width(postW);
      };
      
      /**
       * Keep the actual line from extending beyond the last item's date tab,
       * and keep centered.
       */
      verticalTimeline.adjustLine = function() {
        var $lastItem = $thisObj.find('.item.last');
        var itemPosition = $lastItem.data('isotope-item-position');
        var dateHeight = $lastItem.find('.date').height();
        var dateOffset = $lastItem.find('.date').position();
        var innerMargin = parseInt($lastItem.find('.inner').css('marginTop'));
        var top = (dateOffset == null) ? 0 : parseInt(dateOffset.top);
        var y = (itemPosition != null && itemPosition.y != null) ? 
          parseInt(itemPosition.y) : 0;
        var lineHeight = y + innerMargin + top + (dateHeight / 2);
        var $line = $thisObj.find('.line');
        var $timeline = $thisObj.find('.vertical-timeline-timeline');
        var xOffset = ($timeline.width() / 2) - ($line.width() / 2);
        
        $line.height(lineHeight)
          .css('left', xOffset + 'px');
      };
      
      /**
       * Parse each row of data
       */
      verticalTimeline.parseRow = function(el) {
        // Map the columns.  Tabletop removes spaces.
        $.each(timelineConfig.columnMapping, function(key, column) {
          column = column.split(' ').join('');
          if (el[column]) {
            el[key] = el[column];
          }
        });
        
        // Parse out the date
        el['timestamp'] = Date.parse(el['date']);
        return el;
      };
    
      /**
       * If data is provided directy, the process it manually,
       * otherwise get data via Tabletop and then start rendering.
       */
      if ($.isArray(timelineConfig.data) && timelineConfig.data.length > 0) {
        data = [];
        $.each(timelineConfig.data, function(k, d) {
          data.push(verticalTimeline.parseRow(d));
        });
        verticalTimeline.setupTimeline(data, false);
      }
      else {
        var ttOptions = $.extend({
          key: timelineConfig.key,
          callback: verticalTimeline.setupTimeline,
          wanted: [timelineConfig.sheetName],
          postProcess: verticalTimeline.parseRow
        }, timelineConfig.tabletopOptions);
        
        Tabletop.init(ttOptions);
      }
    });  
  };  


  /**
   * Isotope custom layout mode spineAlign (general)
   */
  $.Isotope.prototype._spineAlignReset = function() {
    this.spineAlign = {
      colA: 0,
      colB: 0,
      lastY: -60
    };
  };
  $.Isotope.prototype._spineAlignLayout = function( $elems ) {
    var instance = this,
      props = this.spineAlign,
      gutterWidth = Math.round( this.options.spineAlign && this.options.spineAlign.gutterWidth ) || 0,
      centerX = Math.round(this.element.width() / 2);
  
    $elems.each(function(i, val) {
      var $this = $(this);
      $this.removeClass('last').removeClass('top');
      if (i == $elems.length - 1)
        $this.addClass('last');
      var x, y;
      if ($this.hasClass('group-marker')) {
        var width = $this.width();
        x = centerX - (width / 2);
        if (props.colA >= props.colB) {
          y = props.colA;
          if (y == 0) $this.addClass('top');
          props.colA += $this.outerHeight(true);
          props.colB = props.colA;
        }
        else {
          y = props.colB;
          if (y == 0) $this.addClass('top');
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
  };
  $.Isotope.prototype._spineAlignGetContainerSize = function() {
    var size = {};
    size.height = this.spineAlign[( this.spineAlign.colB > this.spineAlign.colA ? 'colB' : 'colA' )];
    return size;
  };
  $.Isotope.prototype._spineAlignResizeChanged = function() {
    return true;
  };

})(jQuery, window);
