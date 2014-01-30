# jQuery Vertical Timeline

Forked from the [Super Awesome Vertical Timeline](https://github.com/balancemedia/Timeline).  A [running example can be found here](http://minnpost.github.com/jquery-vertical-timeline/).  Please see the Credits below for some restrictions on use.

## How to Use

### Data

Create a Google Spreadsheet with the following columns (see options for different names) and publish it.  An example can be found [here](https://docs.google.com/spreadsheet/ccc?key=0AsmHVq28GtVJdG1fX3dsQlZrY18zTVA2ZG8wTXdtNHc#gid=0);

* `title` - Title of the post.
* `title icon` - URL to an icon to use for the title.  Should be a 20x20px image.
* `date` - Needs to be in one of the following formats: _'MMM DD, YYYY', 'MM/DD/YYYY', 'M/D/YYYY', 'DD MMM YYYY'_.  A different parsing format can be used with the `dateParse` option.
* `display date` - How to display the date (i.e. Jan 1).  This will appear in the small box in the spine and should be very short.
* `photo url` - URL to a photo.
* `caption` - Caption for the photo.
* `body` - Body text.
* `read more url` - URL for the _read more_ link.

#### Google data access issue (PLEASE READ)

See the issue how [Tabletop.js accesses Google Spreadsheets](https://github.com/jsoma/tabletop#okay-wait-weve-got-a-big-problem-but-a-solution-too).  Basically you have to set up some sort of proxy for the data as some users will have problems otherwise.

### Install the library

It is easiet to install with [bower](http://bower.io/).

    bower install jquery-vertical-timeline

This will install the dependencies as well: [jQuery](http://jquery.com/), [Underscore](http://underscorejs.org/), [TabletopJS](https://github.com/jsoma/tabletop) (this should actually be optional), [MomentJS](http://momentjs.com/), [Isotope](http://isotope.metafizzy.co/), [ImagesLoaded](https://github.com/desandro/imagesloaded)

Do note that [Isotope's license](http://isotope.metafizzy.co/docs/license.html) is not clear and you may have to buy a license to use it.

### Include CSS and JS

Include the CSS:

    <link rel="stylesheet" href="bower_components/jquery-vertical-timeline/dist/jquery-vertical-timeline.min.css">

#### Use JS directly

Include the Javascript (dependencies) and library.

    <script type="text/javascript" src="bower_components/jquery-vertical-timeline/dist/jquery-vertical-timeline.libs.js"></script>
    <script type="text/javascript" src="bower_components/jquery-vertical-timeline/dist/jquery-vertical-timeline.min.js"></script>

#### Use via RequireJS

See the [example.js](https://github.com/MinnPost/jquery-vertical-timeline/blob/master/example/example.js) to see an example.

#### Use via Browserify

This should work if you can get all the dependencies to work as well.

### Use

First, include a container for the timeline:

    <div class="timeline-jquery-example">
    </div>

Call timeline with options.  Note that the `key` is the ID of the Google Spreadsheet, and the `sheetname` is the name of the sheet.

      $('.timeline-jquery-example-1').verticalTimeline({
        key: '0AsmHVq28GtVJdG1fX3dsQlZrY18zTVA2ZG8wTXdtNHc',
        sheetName: 'Posts'
      });

You can also use JSON data directly.  See options below.

## Options

The following options can be passed to the plugin when called:

* `key`: This is the ID of the Google Spreadsheet.
  * Data type: string
  * Default value: `0AsmHVq28GtVJdG1fX3dsQlZrY18zTVA2ZG8wTXdtNHc`
* `sheetName`: This is name of the sheet in the Google Spreadsheet.
  * Data type: string
  * Default value: `Posts`
* `dateParse`: A [moment.js parser formating string or array](http://momentjs.com/docs/#/parsing/string-formats/) that will parse the `date` field.
  * Data type: string or array of strings
  * Default value `['MMM DD, YYYY', 'MM/DD/YYYY', 'M/D/YYYY', 'DD MMM YYYY']`
* `defaultDirection`: This is default order of the timeline.
  * Data type: string
  * Allowed values: `newest`, `oldest`
  * Default value: `newest`
* `defaultExpansion`: This is default state of the posts.
  * Data type: string
  * Allowed values: `expanded`, `collapsed`
  * Default value: `expanded`
* `groupFunction`: The function that will handle the grouping of the timeline.  There are two functions that can be called with a string, otherwise provide your own custom function.
  * Data type: string or function
  * Allowed values: function, `groupSegmentByYear`, `groupSegmentByDecade`, `groupSegmentByDay`
  * Default value: `groupSegmentByYear`
* `sharing`: This turns off and on sharing, but currently should not be used.
  * Data type: boolean
  * Allowed values: `false`, `true`
  * Default value: `false`
* `gutterWidth`: The distance in pixels between post bodies.
  * Data type: integer
  * Default value: `56`
* `width`: The CSS-valid width of the timeline.  The default is `auto` and will use the container.
  * Data type: string
  * Default value: `auto`
* `handleResize`: Enables handling the resize of the timeline to adjust widths.  This is a bit buggy.
  * Data type: boolean
  * Allowed values: `false`, `true`
  * Default value: `false`
* `columnMapping`: This maps specific columns.  This should be an a simple object, where the key is the value is the column expected by the timeline, and the name of the column in the spreadsheet.
  * Data type: object
  * Default value: `{
        'title': 'title',
        'title_icon': 'title icon',
        'date': 'date',
        'display_date': 'display date',
        'photo_url': 'photo url',
        'caption': 'caption',
        'body': 'body',
        'read_more_url': 'read more url',
        'title': 'title'
      }`
* `postTemplate`: HTML template for each post.
  * Data type: string
  * Default value: (see code)
* `groupMarkerTemplate`: HTML template for each group marker.
  * Data type: string
  * Default value: (see code)
* `buttonTemplate`: HTML template for the top buttons.
  * Data type: string
  * Default value: (see code)
* `timelineTemplate`: HTML template for the timeline and middle line.
  * Data type: string
  * Default value: (see code)
* `data`: A javascript array of objects that can be substitued for getting data from a Google Spreadsheet.  See the `example.json` file for an example structure of the data.
  * Data type: object
  * Default value: [none]
* `tabletopOptions`: Overrided tabletop options.  See [Tabletop project](https://github.com/jsoma/tabletop).
  * Data type: object
  * Default value: `{}`

## Development

### Prerequisites

All commands are assumed to on the [command line](http://en.wikipedia.org/wiki/Command-line_interface), often called the Terminal, unless otherwise noted.  The following will install technologies needed for the other steps and will only needed to be run once on your computer so there is a good chance you already have these technologies on your computer.

1. Install [Git](http://git-scm.com/).
   * On a Mac, install [Homebrew](http://brew.sh/), then do: `brew install git`
1. Install [NodeJS](http://nodejs.org/).
   * On a Mac, do: `brew install node`
1. Optionally, for development, install [Grunt](http://gruntjs.com/): `npm install -g grunt-cli`
1. Install [Bower](http://bower.io/): `npm install -g bower`
1. Install [Ruby](http://www.ruby-lang.org/en/downloads/), though it is probably already installed on your system.
1. Install [Bundler](http://gembundler.com/): `gem install bundler`
1. Install [Sass](http://sass-lang.com/): `gem install sass`
   * On a Mac do: `sudo gem install sass`
1. Install [Compass](http://compass-style.org/): `gem install compass`
   * On a Mac do: `sudo gem install compass`

### Get code and install packages

Get the code for this project and install the necessary dependency libraries and packages.

1. Check out this code with [Git](http://git-scm.com/): `git clone https://github.com/MinnPost/jquery-vertical-timeline.git`
1. Go into the template directory: `cd jquery-vertical-timeline`
1. Install NodeJS packages: `npm install`
1. Install Bower components: `bower install`

### Running

1. Run: `grunt server`
    * This will run a local webserver for development and you can view the application in your web browser at [http://localhost:8888](http://localhost:8888).
    * The server watches for files changes and rebuilds project when needed.

### Build

To build or compile all the assets together for easy and efficient deployment, do the following.  It will create all the files in the `dist/` folder.

1. Run: `grunt`

## Bugs and hacks

* IE7 has some styling issues.
* The original sharing code did not work anymore so that is currently removed.
* Please use the [issue queue](https://github.com/MinnPost/jquery-vertical-timeline/issues) to report any more bugs.
* Currently, Tabletop.js extends Array so that indexOf is available.  This has some implications in browsers, especially in the context of for..in loops.  Because of bad code may be in your site that is not easily updatable, we are using a [custom version of Tabletop.js](https://github.com/zzolo/tabletop).  See [pull request](https://github.com/jsoma/tabletop/pull/15).


## Credits

[Balance Media](http://www.builtbybalance.com) for the design and coding.
