# jQuery Vertical Timeline

Forked from the [Super Awesome Vertical Timeline](https://github.com/balancemedia/Timeline).  A running example can be found [here](http://minnpost.github.com/jquery-vertical-timeline/example.html).  Please see the Credits below for some restrictions on use.

## How to Use

### Data

Create a Google Spreadsheet with the following columns (see options for different names) and publish it.  An example can be found [here](https://docs.google.com/spreadsheet/ccc?key=0AsmHVq28GtVJdG1fX3dsQlZrY18zTVA2ZG8wTXdtNHc#gid=0);

* title
* title icon
* date
* display date
* photo url
* caption
* body
* read more url

You may also provide an array of JSON objects using the ```data``` option when initializing the timeline.  The fields are similar to those listed above for the Google Spreadsheets (replace spaces with underscores "_").  See the ```example.json``` file for an example structure of the data.

**Note that the _date_ column must be a valid UNIX timestamp number in milliseconds or a string in the format _Month Day, Year_ (April 25, 2012) for proper sorting.  The _display date_ field is just used for display along the spine.**

**Also, all columns must be _plain text_ format, including the two date columns (unless you provide a UNIX timestamp for _date_).**

**The _title icon_ field can be a relative or absolute URL, and should be a 20x20 px image for best results.**

### Include CSS and JS

Include the CSS:

    <link rel="stylesheet" href="css/style.css">

Include the Javascript.  The following is the un-minified and un-combined version.

    <script type="text/javascript" src="js/libs/jquery-1.7.1.min.js"></script>
    <script type="text/javascript" src="js/libs/handlebars-1.0.rc.1.min.js"></script>
    <script type="text/javascript" src="js/libs/tabletop.master-20121204.min.js"></script>
    <script type="text/javascript" src="js/libs/jquery.isotope.v1.5.21.min.js"></script>
    <script type="text/javascript" src="js/libs/jquery.ba-resize.v1.1.min.js"></script>
    <script type="text/javascript" src="js/libs/jquery.imagesloaded.v2.1.0.min.js"></script>
    <script type="text/javascript" src="js/jquery-veritcal-timeline.js"></script>

OR, use the built version (note, this will only be updated with a specific version):

    <script type="text/javascript" src="js/libs.combined.min.js"></script>
    <script type="text/javascript" src="js/jquery-veritcal-timeline.min.js"></script>

### Run

First, include a container for the timeline:

    <div class="timeline-jquery-example-1">
    </div>

Call timeline with options.  Note that the ```key``` is the ID of the Google Spreadsheet, and the ```sheetname``` is the name of the sheet.

    <script type="text/javascript">
      $(document).ready(function() {
        $('.timeline-jquery-example-1').verticalTimeline({
          key: '0AsmHVq28GtVJdG1fX3dsQlZrY18zTVA2ZG8wTXdtNHc',
          sheetName: 'Posts'
        });
      });
    </script>

An example of loading JSON data using AJAX.

    <script type="text/javascript">
      $(document).ready(function() {
        $.getJSON('./example.json', function(data) {
          $('.timeline-jquery-example-3').verticalTimeline({
            data: data,
            width: '75%'
          });
      });
    </script>

### Updates

You can also update an existing timeline with new data using the following method signature.  This will maintain the same options you set when the timeline was initialized.  This feature is currently limited to JSON data.

    <script type="text/javascript">
      $.getJSON('./example.json', function(data) {
        $('.timeline-jquery-example-3').verticalTimeline('update', data);
      });
    </script>

This allows for viewing of large amounts of timeline data without loading it all at once, and can be used as part of an infinite scroll feature.  See ```example-update.html``` for a quick demo.

## Options

The following options can be passed to the plugin when called:

* ```key```: This is the ID of the Google Spreadsheet.
  * Data type: string
  * Default value: ``````
* ```sheetName```: This is name of the sheet in the Google Spreadsheet.
  * Data type: string
  * Default value: ```Posts```
* ```defaultDirection```: This is default order of the timeline.
  * Data type: string
  * Allowed values: ```newest```, ```oldest```
  * Default value: ```newest```
* ```defaultExpansion```: This is default state of the posts.
  * Data type: string
  * Allowed values: ```expanded```, ```collapsed```
  * Default value: ```expanded```
* ```groupFunction```: The function that will handle the grouping of the timeline.  There are two functions that can be called with a string, otherwise provide your own custom function.
  * Data type: string or function
  * Allowed values: function, ```groupSegmentByDay```, ```groupSegmentByMonth```, ```groupSegmentByYear```, ```groupSegmentByDecade```
  * Default value: ```groupSegmentByYear```
* ```sharing```: This turns off and on sharing, but currently should not be used.
  * Data type: boolean
  * Allowed values: ```false```, ```true```
  * Default value: ```false```
* ```gutterWidth```: The distance in pixels between post bodies.
  * Data type: integer
  * Default value: ```56```
* ```width```: The CSS-valid width of the timeline.  The default is ```auto``` and will use the container.
  * Data type: string
  * Default value: ```auto```
* ```handleResize```: Enables handling the resize of the timeline to adjust widths.  This is a bit buggy.
  * Data type: boolean
  * Allowed values: ```false```, ```true```
  * Default value: ```false```
* ```columnMapping```: This maps specific columns.  This should be an a simple object, where the key is the value is the column expected by the timeline, and the name of the column in the spreadsheet.
  * Data type: object
  * Default value: ```{
        'title': 'title',
        'title_icon': 'title icon',
        'date': 'date',
        'display_date': 'display date',
        'photo_url': 'photo url',
        'caption': 'caption',
        'body': 'body',
        'read_more_url': 'read more url',
        'title': 'title'
      }```
* ```postTemplate```: HTML template for each post.
  * Data type: string
  * Default value: (see code)
* ```groupMarkerTemplate```: HTML template for each group marker.
  * Data type: string
  * Default value: (see code)
* ```buttonTemplate```: HTML template for the top buttons.
  * Data type: string
  * Default value: (see code)
* ```timelineTemplate```: HTML template for the timeline and middle line.
  * Data type: string
  * Default value: (see code)
* ```data```: A javascript array of objects that can be substitued for getting data from a Google Spreadsheet.  See the ```example.json``` file for an example structure of the data.
  * Data type: object
  * Default value: [none]
* ```tabletopOptions```: Overrided tabletop options.  See [Tabletop project](https://github.com/jsoma/tabletop).
  * Data type: object
  * Default value: ```{}```

## Building

Building is only done for specific versions; it simply combines all the libraries and minifies the timeline plugin.  To run the build process, make sure you have [UglifyJS](https://github.com/mishoo/UglifyJS) and run the following:

    bash build.sh

## Bugs and hacks

* IE7 has some styling issues.
* The original sharing code did not work anymore so that is currently removed.
* Please use the [issue queue](https://github.com/MinnPost/jquery-vertical-timeline/issues) to report any more bugs.
* Currently, Tabletop.js extends Array so that indexOf is available.  This has some implications in browsers, especially in the context of for..in loops.  Because of bad code may be in your site that is not easily updatable, we are using a [custom version of Tabletop.js](https://github.com/zzolo/tabletop).  See [pull request](https://github.com/jsoma/tabletop/pull/15).


## Credits

[Balance Media](http://www.builtbybalance.com) for the design and coding.

The following plugins/libraries are used:
[jQuery](http://jquery.com/), [Isotope](http://isotope.metafizzy.co), [Tabletop.js](http://github.com/jsoma/tabletop), [Handlebars.js](http://handlebarsjs.com/), [jQuery imagesLoaded plugin](http://github.com/desandro/imagesloaded), and [jQuery resize event](http://benalman.com/projects/jquery-resize-plugin/)

Sample Icon Credits:
* [Paul Robert Lloyd](https://www.iconfinder.com/iconsets/socialmediaicons_v120)
* [Visual Pharm](https://www.iconfinder.com/iconsets/ios-7-icons)

NOTE: All of the elements are free for non-commercial use. Commercial use of [Isotope](http://isotope.metafizzy.co) requires a $25 [license](http://metafizzy.co/#isotope-license).
