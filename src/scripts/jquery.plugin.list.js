/*
 * A jQuery plugin based on a Pen by Blake Bowen
 * http://codepen.io/osublake/pen/RNLdpz
 */
;(function ( $, window, document, undefined ) {

	"use strict";

		// defaults
		var pluginName = "list",
			defaults = {
			rowSize: 			40,
			colSize: 			60,
			gutter: 			7,   		// Spacing between tiles
			threshold: 		"50%", 	// This is amount of overlap between tiles needed to detect a collision
			mode: 				'mixed', // mixed | column | fixed
			startWidth: 	"100%",
			startSize:  	100,
			singleWidth: 	300,
			shadow1: 			"0 1px 3px  0 rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.6)",
			shadow2: 			"0 6px 10px 0 rgba(0, 0, 0, 0.3), 0 2px 2px 0 rgba(0, 0, 0, 0.2)"
		};

		// plugin constructor
		function Plugin ( element, options ) {

				this.fixedSize = 		false;	// When true, each tile's colspan will be fixed to 1
				this.oneColumn =	 		false;	// When true, grid will only have 1 column and tiles have fixed colspan of 1
				this.$list			= 		null;
				this.colCount 	= 		null;
				this.rowCount	= 		null;
				this.gutterStep=		 	null;
				this.label 		= 		1;
				this.zIndex 	= 1000;
				this.tiles 		= null;
				
				this.element = element;
				this.settings = $.extend( {}, defaults, options );
		
				this._defaults = defaults;
				this._name = pluginName;

				this.init();
		}

		$.extend(Plugin.prototype, {
				
				init: function () {
					  this.$list = $(this.element);
						this.tiles = this.$list[0].getElementsByClassName("tile");

						this.settings.startSize = this.settings.colSize;
						this.settings.singleWidth = this.settings.colSize * 3;
					  var width = this.settings.startWidth;
					  switch ( this.settings.mode ) {

					    case "mixed":
					      this.fixedSize = false;
					      this.oneColumn = false;
					      this.settings.colSize   = this.settings.startSize;
					      break;

					    case "fixed":
					      this.fixedSize = true;
					      this.oneColumn = false;
					      this.settings.colSize   = this.settings.startSize;
					      break;

					    case "column":
					    console.log('init:', this.settings.mode);

					      this.fixedSize = false;
					      this.oneColumn = true;
					      width     							= '100%';//this.settings.singleWidth;
					      this.settings.colSize   = this.settings.singleWidth;
					      break;
					  }

					  this.$list.find(".tile").remove();

					  TweenLite.to(this.$list, 0.2, { width: this.settings.mode === 'column' ? '100%' : width });
					  var scope = this;
					  TweenLite.delayedCall(0.25, function() {

					  	scope.resize();

					    for (var i = 0; i < 10; i++) {
					      scope.createTile();
					    }
					  });

						
						$(window).on('resize', function(){
						 	scope.resize();
		 			  }); 

				},
				resize: function () {
					this.colCount   = this.oneColumn ? 1 : Math.floor(this.$list.outerWidth() / (this.settings.colSize + this.settings.gutter));
	  			this.gutterStep = this.colCount === 1 ? this.settings.gutter : (this.settings.gutter * (this.colCount - 1) / this.colCount);

	  			this.rowCount   = 0;
	  			this.layoutInvalidated();
				},
				createTile: function () {
					var colspan = this.fixedSize || this.oneColumn ? 1 : Math.floor(Math.random() * 2) + 1;
				  var element = $('<div class="tile"><i class="fa fa-bolt fa-6"></i></div>');//.append('<p>' + (this.label++)+'</p>');
				  var lastX   = 0;
				  var scope   = this;


				  Draggable.create(element, {
				    onDrag      : onDrag,
				    onPress     : onPress,
				    onRelease   : onRelease,
				    zIndexBoost : false
				  });

				  // NOTE: Leave rowspan set to 1 because this demo 
				  // doesn't calculate different row heights
				  var tile = {
				    col        : null,
				    colspan    : colspan,
				    height     : 0,
				    inBounds   : true,
				    index      : null,
				    isDragging : false,
				    lastIndex  : null,
				    newTile    : true,
				    positioned : false,
				    row        : null,
				    rowspan    : 1, 
				    width      : 0,
				    x          : 0,
				    y          : 0
				  };

				  // Add tile properties to our element for quick lookup
				  element[0].tile = tile;

				  this.$list.append(element);
				  this.layoutInvalidated();

				  function onPress() {

				    lastX = this.x;
				    tile.isDragging = true;
				    tile.lastIndex  = tile.index;

				    TweenLite.to(element, 0.2, {
				      autoAlpha : 0.75,
				      boxShadow : scope.settings.shadow2,
				      scale     : 0.95,
				      zIndex    : "+=1000"
				    });
				  }

				  function onDrag() {

				    // Move to end of list if not in bounds
				    if (!this.hitTest(scope.$list, 0)) {
				      tile.inBounds = false;
				      scope.changePosition(tile.index, scope.tiles.length - 1);
				      return;
				    }

				    tile.inBounds = true;

				    for (var i = 0; i < scope.tiles.length; i++) {

				      // Row to update is used for a partial layout update
				      // Shift left/right checks if the tile is being dragged 
				      // towards the the tile it is testing
				      var testTile    = scope.tiles[i].tile;
				      var onSameRow   = (tile.row === testTile.row);
				      var rowToUpdate = onSameRow ? tile.row : -1;
				      var shiftLeft   = onSameRow ? (this.x < lastX && tile.index > i) : true;
				      var shiftRight  = onSameRow ? (this.x > lastX && tile.index < i) : true;
				      var validMove   = (testTile.positioned && (shiftLeft || shiftRight));

				      if (this.hitTest(scope.tiles[i], scope.settings.threshold) && validMove) {
				        scope.changePosition(tile.index, i, rowToUpdate);
				        break;
				      }
				    }

				    lastX = this.x;
				  }

				  function onRelease() {

				    // Move tile back to last position if released out of bounds
				    this.hitTest(scope.$list, 0)
				      ? scope.layoutInvalidated()
				      : scope.changePosition(tile.index, tile.lastIndex);

				    TweenLite.to(element, 0.2, {
				      autoAlpha : 1,
				      boxShadow : scope.settings.shadow1,
				      scale     : 1,
				      x         : tile.x,
				      y         : tile.y,
				      zIndex    : ++scope.zIndex
				    });

				    tile.isDragging = false;
				  }
				},

				layoutInvalidated: function (rowToUpdate) {

				  var timeline = new TimelineMax();
				  var partialLayout = (rowToUpdate > -1);

				  var height = 0;
				  var col    = 0;
				  var row    = 0;
				  var time   = 0.35;
				  var scope = this;

				  this.$list.find(".tile").each(function(index, element) {

				    var tile    = this.tile;
				    var oldRow  = tile.row;
				    var oldCol  = tile.col;
				    var newTile = tile.newTile;
				    // PARTIAL LAYOUT: This condition can only occur while a tile is being 
				    // dragged. The purpose of this is to only swap positions within a row, 
				    // which will prevent a tile from jumping to another row if a space
				    // is available. Without this, a large tile in column 0 may appear 
				    // to be stuck if hit by a smaller tile, and if there is space in the 
				    // row above for the smaller tile. When the user stops dragging the 
				    // tile, a full layout update will happen, allowing tiles to move to
				    // available spaces in rows above them.
				    if (partialLayout) {
				      row = tile.row;
				      if (tile.row !== rowToUpdate) return;
				    }

				    // Update trackers when colCount is exceeded 
				    if (col + tile.colspan > scope.colCount) {
				      col = 0; row++;
				    }

				    $.extend(tile, {
				      col    : col,
				      row    : row,
				      index  : index,
				      x      : col * scope.gutterStep + (col * scope.settings.colSize),
				      y      : row * scope.gutterStep + (row * scope.settings.rowSize),
				      width  : tile.colspan * scope.settings.colSize + ((tile.colspan - 1) * scope.gutterStep),
				      height : tile.rowspan * scope.settings.rowSize
				    });
						
						// to do ~ clean that mess :)
						if ( scope.settings.mode === 'column' ) tile.width = '100%';
				    
				    col += tile.colspan;

				    // If the tile being dragged is in bounds, set a new
				    // last index in case it goes out of bounds
				    if (tile.isDragging && tile.inBounds) {
				      tile.lastIndex = index;
				    }

				    if (newTile) {

				      // Clear the new tile flag
				      tile.newTile = false;

				      var from = {
				        autoAlpha : 0,
				        boxShadow : scope.settings.shadow1,
				        height    : tile.height,
				        scale     : 0,
				        width     : tile.width
				      };

				      var to = {
				        autoAlpha : 1,
				        scale     : 1,
				        zIndex    : scope.zIndex
				      };

				      timeline.fromTo(element, time, from, to, "reflow");

				    }

				    // Don't animate the tile that is being dragged and
				    // only animate the tiles that have changes
				    if (!tile.isDragging && (oldRow !== tile.row || oldCol !== tile.col)) {

				      var duration = newTile ? 0 : time;

				      // Boost the z-index for tiles that will travel over 
				      // another tile due to a row change
				      if (oldRow !== tile.row) {
				        timeline.set(element, { zIndex: ++ scope.zIndex }, "reflow");
				      }

				      timeline.to(element, duration, {
				        x : tile.x,
				        y : tile.y,
				        onComplete : function() { tile.positioned = true; },
				        onStart    : function() { tile.positioned = false; }
				      }, "reflow");
				    }
				  });

				  // If the row count has changed, change the height of the container
				  if (row !== scope.rowCount) {
				    scope.rowCount = row;
				    height   = scope.rowCount * scope.gutterStep + (++row * scope.settings.rowSize);
				    timeline.to(scope.$list, 0.2, { height: height }, "reflow");
				  }

				},
				changePosition: function (from, to, rowToUpdate) {

				  var $tiles = this.$list.find(".tile");
				  var insert = from > to ? "insertBefore" : "insertAfter";

				  // Change DOM positions
				  $tiles.eq(from)[insert]($tiles.eq(to));

				  this.layoutInvalidated(rowToUpdate);
				},


		});

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
				return this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}
				});
		};

})( jQuery, window, document );
