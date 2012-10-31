/**
 * jQuery Grid Slider
 * Copyright (c) 2012 Allan Ma (http://codecanyon.net/user/webtako)
 * Version: 1.1 (03/06/2012)
 */
;(function($) {
  var TOP = "top";
  var BOTTOM = "bottom";
  var LEFT = "left";
  var RIGHT = "right";
  var OUTSIDE = "outside";
  var INSIDE = "inside";

  var TILE_OPACITY = 0.85;
  var ANIMATE_SPEED = "normal";
  var DEFAULT_DURATION = 600;
  var DEFAULT_DELAY = 8000;
  var SCROLL_RATE = 10;
  var SWIPE_MIN = 50;
  var SWF_RE = /[^\s]+\.(swf)/i;
  var ERROR_MSG = "Error Loading Content";
  var EFFECTS = {"none":0, "fade":1, "h_slide":2, "v_slide":3};
  var CAPTION_EFFECTS = {"none":0, "fade":1, "slide":2};

  var SWITCH_INDEX = "switch_index";
  var UPDATE_NUM = "update_num";
  var UPDATE_INDEX = "update_index";
  var UPDATE_INDEX_LIST = "update_idx_list";
  var UPDATE_BUTTONS = "update_buttons";
  var UPDATE_MENU_BUTTONS = "update_menu_buttons";
  var UPDATE_PANE_BUTTONS = "update_pane_buttons";
  var UPDATE_TILES = "update_tiles";
  var OPEN_PANE = "open_pane";
  var CLOSE_PANE = "close_pane";
  var LB_OPEN = "lightbox_open";

  //Class Grid Slider
  function GridSlider($obj, opts) {
    this._numCols =     getPosNumber(opts.num_cols,4);
    this._numRows =     getPosNumber(opts.num_rows,2);
    this._margin =      getNonNegNumber(opts.margin,10);
    this._tileWidth =     getPosNumber(opts.tile_width,225);
    this._tileHeight =    getPosNumber(opts.tile_height,150);
    this._tileMargin =    getNonNegNumber(opts.tile_margin,5);
    this._tileBorder =    getNonNegNumber(opts.tile_border,1);
    this._autoScale =   opts.auto_scale;
    this._autoCenter =    opts.auto_center;
    this._rotate =      opts.auto_rotate;
    this._delay =       getPosNumber(opts.delay,DEFAULT_DELAY);
    this._mouseoverPause =  window.Touch ? false : opts.mouseover_pause;
    this._effect =      opts.effect.toLowerCase();
    this._duration =    getPosNumber(opts.duration,DEFAULT_DURATION);
    this._easing =      opts.easing;
    this._displayOverlay =  opts.display_panel;
    this._overlayDir =    opts.panel_direction;
    this._displayTimer =  opts.display_timer;
    this._displayButtons =  opts.display_dbuttons;
    this._mouseoverButtons = opts.mouseover_dbuttons;
    this._displayNumInfo =  opts.display_numinfo;
    this._displayIndex =  opts.display_index;
    this._displayNum =    opts.display_number;
    this._displayPlayBtn =  opts.display_play;
    this._displayCaption =  opts.display_caption;
    this._mouseoverCaption = window.Touch ? false : opts.mouseover_caption;
    this._captionEffect =   opts.caption_effect.toLowerCase();
    this._captionPos =    opts.caption_position.toLowerCase();
    this._captionAlign =  opts.caption_align.toLowerCase();
    this._textWidth =   getPosNumber(opts.caption_width,0);
    this._textHeight =    getPosNumber(opts.caption_height,0);
    this._contNav =     opts.cont_nav;
    this._shuffle =     opts.shuffle;
    this._catIndex =    getNonNegNumber(opts.category_index,0);
    this._multiCategory = opts.multi_category;
    this._mousewheelScroll = opts.mousewheel_scroll;
    this._formMethod =    opts.type.toUpperCase();

    this._$slider;
    this._$tilePanel;
    this._$mainBox;
    this._$tileBox;
    this._$prevBtn;
    this._$nextBtn;
    this._$cpanel;
    this._$lists;
    this._$currList;
    this._$tiles;
    this._$overlay;
    this._$contentFrame;
    this._$contentNum;
    this._$outerContent;
    this._$innerContent;
    this._$scrollbar;
    this._$thumb;
    this._$centerPanel;
    this._$indexPanel;
    this._$timer;
    this._$numInfo;
    this._$menuItems;
    this._$playBtn;
    this._$menuList;

    this._timerId;
    this._index;
    this._menuIndex;
    this._paneIndex;
    this._numDisplay;
    this._extX;
    this._extY;
    this._extWidth;
    this._extHeight;
    this._unitW;
    this._unitH;
    this._wPad;
    this._hPad;
    this._numPanes;
    this._frameHeight;
    this._slideCoord;

    this.init($obj);
  }

  GridSlider.prototype.init = function($obj) {
    this._$slider =     $obj.find(".g-slider");
    this._$tilePanel =  this._$slider.find(">.tiles");
    this._$lists =    this._$tilePanel.find(">ul");
    this._$tiles =    this._$lists.find(">li");
    this._$tilePanel.wrap("<div class='main-box'><div class='tiles-box'></div></div>");
    this._$mainBox = this._$slider.find(">.main-box");
    $tileBox = this._$mainBox.find(">.tiles-box");
    if (!this._multiCategory) {
      this.setNoCategory();
    }

    this._timerId = null;
    this._index = 0;
    this._numDisplay = this._numCols * this._numRows;
    this._extY = this._extX = this._extHeight = this._extWidth = 0;
    if (this._catIndex > this._$lists.size() - 1) {
      this._catIndex = 0;
    }

    //init components
    this.initLists();
    this.initList(this._catIndex);
    this.initSlidePanel();
    this.initMenu();
    this.initCPanel();
    this.initOverlay();
    var sliderHeight = this._$mainBox.height() + (this._displayTimer ? this._$timer.height() : 0) + (this._$cpanel.is(":empty") ? 0 : this._$cpanel.height());
    this._$slider.css({width:this._$mainBox.width(), height:sliderHeight, paddingTop:this._margin, paddingLeft:this._margin, paddingRight:this._margin});

    this.changeCategory(this._catIndex);
    if (window.Touch) {
      this._slideCoord = {start:-1, end:-1};
      if (this._effect == "v_slide") {
        this._$tilePanel.bind("touchstart", {elem:this}, this.touchVStart).bind("touchmove", {elem:this}, this.touchVMove);
      }
      else {
        this._$tilePanel.bind("touchstart", {elem:this}, this.touchStart).bind("touchmove", {elem:this}, this.touchMove);
      }
      this._$tilePanel.bind("touchend", {elem:this}, this.touchEnd);
    }
    else if (this._mousewheelScroll) {
      this._$tilePanel.bind("mousewheel", {elem:this}, this.mousewheelScroll).bind("DOMMouseScroll", {elem:this}, this.mousewheelScroll);
      this._$slider.bind("mousewheel", preventDefault).bind("DOMMouseScroll", preventDefault);
    }

    if (this._mouseoverPause) {
      this._$slider.bind("mouseenter", {elem:this}, this.pause).bind("mouseleave", {elem:this}, this.play);
    }

    $(document).bind(LB_OPEN, {elem:this}, this.pause);
  }

  //init all lists
  GridSlider.prototype.initLists = function() {
    this.initCaptions();
    this._$lists.css("opacity", 0).data({init:false, index:0});
    for (var i = 0; i < this._$lists.size(); i++) {
      var $list = this._$lists.eq(i);
      var $items = $list.find(">li");
      var numItems = $items.size();
      var numIndex = Math.ceil(numItems/this._numDisplay);
      if (this._shuffle) {
        $items = this.shuffleItems($list);
      }
      $list.data({items:$items, numItems:numItems, numIndex:numIndex, multi:numIndex > 1});
    }
  }

  //init list
  GridSlider.prototype.initList = function(idx) {
    var $list =  this._$lists.eq(idx);
    var $items = $list.find(">li");
    this.initItems($items);

    var n = $list.data("numItems");
    this._unitW = $items.outerWidth(true) * this._numCols;
    this._unitH = $items.outerHeight(true) * this._numRows;
    for (var i = 0; i < n; i+=this._numDisplay) {
      $list.append("<li class='sub'><ul class='sub'></ul></li>");
      var $subItem = $list.find(">li.sub:last-child");
      var $subList = $subItem.find(">ul");
      $subItem.css({width:this._unitW, height:this._unitH});
      $subList.css({width:this._unitW, height:this._unitH}).append($items.slice(i, i + this._numDisplay));
    }

    switch(EFFECTS[this._effect]) {
      case EFFECTS["h_slide"]:
        $list.css({width:$list.data("numIndex") * this._unitW, height:this._unitH});
        break;
      case EFFECTS["v_slide"]:
        $list.css({width:this._unitW, height:$list.data("numIndex") * this._unitH});
        break;
      default:
        $list.css({width:this._unitW, height:this._unitH});
        var $subItems = $list.find(">li.sub");
        $subItems.addClass("stack").not(":first").css("opacity",0);
        $subItems.first().css("zIndex",1);
    }
    $list.data("init", true);
  }

  //init items
  GridSlider.prototype.initItems = function($items) {
    var itemSize = $items.size();
    for (var i = 0; i < itemSize; i++) {
      var $item = $items.eq(i);
      var $img;
      var $link = $item.find(">a:first");
      if ($link.size() == 0) {
        if (this._displayOverlay && $item.find(">.content").size() > 0) {
          $item.data("type", "static").css("cursor", "pointer").bind("click", {elem:this, i:i}, this.openOverlay);
        }
        else {
          $item.click(preventDefault);
        }
        $img = $item.find(">img");
      }
      else {
        if (this._displayOverlay) {
          if ($item.find(">.content").size() > 0) {
            $item.data("type", "static");
          }
          else {
            var contentType = this.getContentType($link);
            var url = $link.attr("href");
            $item.data({type:contentType, url:(typeof url != "undefined") ? url : ""});
          }
          $item.css("cursor", "pointer").bind("click", {elem:this, i:i}, this.openOverlay);
        }
        $link.data("text", $item.find(">div:first").html());
        $img = $link.find(">img");
      }

      if ($img.size() > 0) {
        $img.addClass("thumbnail");
        $img[0].complete || $img[0].readyState == "complete" ? this.processImg($img) : $img.bind("load", {elem:this}, this.processLoadedImg);
      }

      if (this._displayCaption && this._captionPos == INSIDE) {
        this.initCaption($item);
      }

      $item.data({index:i, image:$img});
    }
    $items.css({width:this._tileWidth + this._extWidth, height:this._tileHeight + this._extHeight, marginRight:this._tileMargin, marginBottom:this._tileMargin, borderWidth:this._tileBorder})
        .hover(this.itemMouseover, this.itemMouseout);
  }

  //init slide panel
  GridSlider.prototype.initSlidePanel = function() {
    this._$tilePanel.css({width:this._unitW - this._tileMargin, height:this._unitH - this._tileMargin});
    this._$mainBox.width(this._$tilePanel.width());
  }

  //init captions
  GridSlider.prototype.initCaptions = function() {
    var $captions = this._$tiles.find(">div:not('.content'):first");
    if (this._displayCaption) {
      $captions.addClass("caption");
      this._wPad = $captions.outerWidth() - $captions.width();
      this._hPad = $captions.outerHeight() - $captions.height();
      if (this._captionPos == OUTSIDE) {
        switch(this._captionAlign) {
          case LEFT:
            $captions.height(this._tileHeight - this._hPad);
            this._textWidth = this.getTextWidth();
            $captions.css({width:this._textWidth, left:0});
            this._extX = this._extWidth = $captions.outerWidth();
            break;
          case RIGHT:
            $captions.height(this._tileHeight - this._hPad);
            this._textWidth = this.getTextWidth();
            $captions.css({width:this._textWidth, left:this._tileWidth});
            this._extWidth = $captions.outerWidth();
            break;
          case TOP:
            $captions.width(this._tileWidth - this._wPad);
            this._textHeight = this.getTextHeight();
            $captions.css({height:this._textHeight - this._hPad, top:0});
            this._extY = this._extHeight = $captions.outerHeight();
            break;
          default:
            $captions.width(this._tileWidth - this._wPad);
            this._textHeight = this.getTextHeight();
            $captions.css({height:this._textHeight - this._hPad, top:this._tileHeight});
            this._extHeight = $captions.outerHeight();
        }
        $captions.addClass("outside");
      }
    }
    else {
      $captions.hide();
    }
  }

  //init caption
  GridSlider.prototype.initCaption = function($item) {
    var $caption = $item.find(">div:not('.content'):first");
    if ($caption.size() == 0 || $caption.html() == "") {
      $caption.remove();
      return;
    }

    if (this._captionAlign == LEFT || this._captionAlign == RIGHT) {
      $caption.height(this._tileHeight - this._hPad).width($caption.outerWidth() - this._wPad);
      if (this._textWidth > 0) {
        $caption.width(Math.min(this._textWidth - this._wPad, this._tileWidth - this._wPad));
      }
      $caption.css("left", this._captionAlign == LEFT ? 0 : this._tileWidth - $caption.outerWidth());
    }
    else {
      $caption.width(this._tileWidth - this._wPad);
      if (this._textHeight > 0) {
        $caption.height(Math.min(this._textHeight - this._hPad, this._tileHeight - this._hPad));
      }
      $caption.css("top", this._captionAlign == TOP ? 0 : this._tileHeight - $caption.outerHeight());
    }

    if (this._mouseoverCaption) {
      $item.data("caption", $caption);
      switch(CAPTION_EFFECTS[this._captionEffect]) {
        case CAPTION_EFFECTS["slide"]:
          if (this._captionAlign == LEFT) {
            $item.data({textPos:0, textOff:-$caption.outerWidth()});
            $caption.css("left", $item.data("textOff"));
            $item.hover(this.slideInHText, this.slideOutHText);
          }
          else if (this._captionAlign == RIGHT) {
            $item.data({textPos:this._tileWidth - $caption.outerWidth(), textOff:this._tileWidth});
            $caption.css("left", $item.data("textOff"));
            $item.hover(this.slideInHText, this.slideOutHText);
          }
          else if (this._captionAlign == TOP) {
            $item.data({textPos:0, textOff:-$caption.outerHeight()});
            $caption.css("top", $item.data("textOff"));
            $item.hover(this.slideInVText, this.slideOutVText);
          }
          else {
            $item.data({textPos:this._tileHeight - $caption.outerHeight(), textOff:this._tileHeight});
            $caption.css("top", $item.data("textOff"));
            $item.hover(this.slideInVText, this.slideOutVText);
          }
          break;
        case CAPTION_EFFECTS["fade"]:
          if (!(jQuery.browser.msie && parseInt(jQuery.browser.version) < 9)) {
            $caption.css("opacity", 0);
            $item.hover(this.fadeInText, this.fadeOutText);
            break;
          }
        default:
          $caption.css("visibility", "hidden");
          $item.hover(this.showText, this.hideText);
      }
    }
  }

  GridSlider.prototype.getTextWidth = function() {
    if (this._textWidth == 0) {
      var widths = this._$tiles.find(">div:not('.content'):first").map(function() { return $(this).outerWidth(); }).get();
      this._textWidth = Math.max.apply(Math, widths);
    }
    return this._textWidth;
  }

  GridSlider.prototype.getTextHeight = function() {
    if (this._textHeight == 0) {
      var heights = this._$tiles.find(">div:not('.content'):first").map(function() { return $(this).outerHeight(); }).get();
      this._textHeight = Math.max.apply(Math, heights);
    }
    return this._textHeight;
  }

  //show text
  GridSlider.prototype.showText = function() {
    $(this).data("caption").css("visibility", "visible");
  }

  GridSlider.prototype.hideText = function() {
    $(this).data("caption").css("visibility", "hidden");
  }

  //fade text
  GridSlider.prototype.fadeInText = function() {
    $(this).data("caption").stop(true).animate({opacity:1}, "fast");
  }

  GridSlider.prototype.fadeOutText = function() {
    $(this).data("caption").stop(true).animate({opacity:0}, "fast");
  }

  //slide text
  GridSlider.prototype.slideInVText = function() {
    $(this).data("caption").stop(true).animate({top:$(this).data("textPos")}, "fast");
  }

  GridSlider.prototype.slideOutVText = function() {
    $(this).data("caption").stop(true).animate({top:$(this).data("textOff")}, "fast");
  }

  //slide text
  GridSlider.prototype.slideInHText = function() {
    $(this).data("caption").stop(true).animate({left:$(this).data("textPos")}, "fast");
  }

  GridSlider.prototype.slideOutHText = function() {
    $(this).data("caption").stop(true).animate({left:$(this).data("textOff")}, "fast");
  }

  //init menu
  GridSlider.prototype.initMenu = function($frame) {
    if (this._$lists.size() > 1) {
      var that = this;
      var content =  "<div class='menu-bar'>\
                <div class='menu-panel'>\
                  <ul class='menu'>";
      this._$lists.each(function() {
        content +=        "<li>" + $(this).attr("title") + "</li>";
      });
      content +=           "</ul>\
                </div>\
              </div>";

      $tileBox.prepend(content);
      var $menuBar = $tileBox.find(">.menu-bar");
      var $menuPanel = $menuBar.find(">.menu-panel");

      $menuBar.width(this._$tilePanel.width() - ($menuBar.outerWidth() - $menuBar.width()));
      $menuPanel.width($menuBar.width());

      this._$menuList =  $menuPanel.find(">ul.menu");
      this._$menuItems = this._$menuList.find(">li");
      this._$menuItems.click(function() {
                  var i = $(this).index();
                  if (i != that._$menuItems.filter(".selected").index()) {
                    that.changeCategory(i);
                  }
                });

      var widths =  this._$menuItems.map(function() { return $(this).outerWidth(); }).get();
      var itemWidth = Math.max.apply(Math, widths);
      var availWidth = Math.round($menuPanel.width()/this._$menuItems.size());
      var padding = this._$menuItems.outerWidth() - this._$menuItems.width();
      if (availWidth < itemWidth) {
        //init menu buttons
        $menuBar.append("<div class='menu-buttons'>\
                  <div class='menu-back'></div>\
                  <div class='menu-fwd'></div>\
                 </div>");
        var $menuButtons = $menuBar.find(">.menu-buttons");
        var $menuBack = $menuButtons.find(">.menu-back");
        var $menuFwd =  $menuButtons.find(">.menu-fwd");
        $menuPanel.width($menuPanel.width() - $menuButtons.outerWidth());
        var numItems = Math.floor($menuPanel.width()/itemWidth);
        if (numItems > 0) {
          var pct = Math.round((1/numItems) * 100)/100;
          this._$menuItems.width(Math.floor(pct * $menuPanel.width()) - padding);
        }
        else {
          this._$menuItems.css({paddingLeft:0, paddingRight:0});
          padding = this._$menuItems.outerWidth() - this._$menuItems.width();
          this._$menuItems.width($menuPanel.width() - padding);
          numItems = 1;
        }
        this._$menuList.width(this._$menuItems.size() * this._$menuItems.outerWidth());
        $menuPanel.width(numItems * this._$menuItems.outerWidth());

        this._menuIndex = 0;
        maxMenuIndex = this._$menuItems.size() - numItems;
        this._$slider.bind(UPDATE_MENU_BUTTONS, function() {
          $menuBack.toggleClass("off", that._menuIndex == 0);
          $menuFwd.toggleClass("off", that._menuIndex == maxMenuIndex);
        });

        $menuBack.bind("click", {elem:this}, this.menuBack);
        $menuFwd.bind("click", {elem:this}, this.menuFwd);

        if (window.Touch) {
          var menuCoord = {start:-1, end:-1};
          $menuPanel.bind("touchstart", function(e) {
            menuCoord.start = e.originalEvent.touches[0].pageX;
          })
          .bind("touchmove", function(e) {
            e.preventDefault();
            menuCoord.end = e.originalEvent.touches[0].pageX;
          })
          .bind("touchend", function() {
            if (menuCoord.end >= 0) {
              if (Math.abs(menuCoord.start - menuCoord.end) > SWIPE_MIN) {
                if (menuCoord.end < menuCoord.start) {
                  that.menuFwd();
                }
                else {
                  that.menuBack();
                }
              }
            }
            menuCoord.start = menuCoord.end = -1;
          });
        }
        else if (this._mousewheelScroll) {
          $menuBar.bind("mousewheel", {elem:this}, this.scrollMenu).bind("DOMMouseScroll", {elem:this}, this.scrollMenu);
        }
        this._$slider.trigger(UPDATE_MENU_BUTTONS);
      }
      else {
        var numItems = this._$menuItems.size();
        var pct = Math.round((1/numItems) * 100)/100;
        this._$menuItems.width(Math.floor(pct * $menuPanel.width()) - padding);
        var $lastItem = this._$menuItems.last();
        $lastItem.css("border", "none").width($menuPanel.width() - ((numItems - 1) * this._$menuItems.outerWidth()) - ($lastItem.outerWidth() - $lastItem.width()));
        this._$menuList.width($menuPanel.width());
      }
    }
    this._$lists.removeAttr("title");
  }

  //move menu back
  GridSlider.prototype.menuBack = function(e) {
    var that = (typeof e != "undefined") ? e.data.elem : this;
    if (that._menuIndex > 0) {
      that._menuIndex--;
      that._$menuList.stop(true).animate({left:-that._$menuItems.eq(that._menuIndex).position().left}, ANIMATE_SPEED);
      that._$slider.trigger(UPDATE_MENU_BUTTONS);
    }
  }

  //move menu forward
  GridSlider.prototype.menuFwd = function(e) {
    var that = (typeof e != "undefined") ? e.data.elem : this;
    if (that._menuIndex < maxMenuIndex) {
      that._menuIndex++;
      that._$menuList.stop(true).animate({left:-that._$menuItems.eq(that._menuIndex).position().left}, ANIMATE_SPEED);
      that._$slider.trigger(UPDATE_MENU_BUTTONS);
    }
  }

  //wheel scroll menu
  GridSlider.prototype.scrollMenu = function(e) {
    var that = e.data.elem;
    if (!that._$menuList.is(":animated")) {
      var delta = (typeof e.originalEvent.wheelDelta == "undefined") ?  -e.originalEvent.detail : e.originalEvent.wheelDelta;
      delta > 0 ? that.menuBack() : that.menuFwd();
    }
  }

  //init cpanel
  GridSlider.prototype.initCPanel = function() {
    var content =  "<div class='timer-box'>\
              <div class='timer'></div>\
            </div>\
            <div class='cpanel'><div class='num-info'></div><div class='center-panel'><div class='index-panel'></div></div><div class='play-btn'></div></div>"
    this._$slider.append(content);
    this._$cpanel = this._$slider.find(">.cpanel");
    this._$centerPanel = this._$cpanel.find(">.center-panel");
    this._$indexPanel = this._$centerPanel.find(">.index-panel");
    this.initTimer();
    this.initDButtons();
    this.initNumInfo();
    this.initPlay();

    if (this._displayIndex) {
      this._$indexPanel.data({maxWidth:this._$tilePanel.width() - ((2 * Math.max(this._$numInfo.width(), this._$playBtn.width())) + this._$centerPanel.find(">.s-prev").width() + this._$centerPanel.find(">.s-next").width()), scroll:false});
      this.initIndexes();
      if (this._$indexPanel.find(">ul.indexes").size() > 0) {
        this.initIndexScroll();
        this._$slider.bind(SWITCH_INDEX, {elem:this}, this.switchIndex);
      }
      else {
        this._$indexPanel.remove();
      }
    }
    else {
      this._$indexPanel.remove();
    }

    this._$slider.css("paddingBottom", 0);
    if (this._$centerPanel.is(":empty")) {
      this._$centerPanel.remove();
      if (!this._displayPlayBtn && !this._displayNumInfo) {
        this._$cpanel.remove();
        this._$slider.css("paddingBottom", this._margin);
      }
    }
  }

  //init timer bar
  GridSlider.prototype.initTimer = function() {
    var $timerBox = this._$slider.find(">.timer-box");
    this._$timer = $timerBox.find(">.timer");
    this._$timer.data("pct", 1);
    if (!this._displayTimer) {
      $timerBox.hide();
    }
  }

  //init directional buttons
  GridSlider.prototype.initDButtons = function() {
    if (this._displayButtons) {
      var that = this;
      if (this._mouseoverButtons) {
        this._$slider.append("<div class='prev-btn'>&laquo;</div><div class='next-btn'>&raquo;</div>");
        this._$prevBtn = this._$slider.find(">.prev-btn");
        this._$nextBtn = this._$slider.find(">.next-btn");
        if (window.Touch) {
          this._$prevBtn.css("left", 0);
          this._$nextBtn.css("marginLeft", -this._$nextBtn.width());
        }
        else {
          this._$prevBtn.css("left", -(this._$prevBtn.width()+1));
          this._$nextBtn.css("marginLeft", 1);
          this._$slider.hover(
            function() {
              that._$prevBtn.stop(true).animate({left:0}, ANIMATE_SPEED);
              that._$nextBtn.stop(true).animate({marginLeft:-that._$nextBtn.width()}, ANIMATE_SPEED);
            },
            function() {
              that._$prevBtn.stop(true).animate({left:-(that._$prevBtn.width()+1)}, ANIMATE_SPEED);
              that._$nextBtn.stop(true).animate({marginLeft:1}, ANIMATE_SPEED);
            });
        }
      }
      else {
        this._$prevBtn = $("<div class='s-prev'>&laquo;</div>");
        this._$nextBtn = $("<div class='s-next'>&raquo;</div>");
        this._$centerPanel.prepend(this._$prevBtn);
        this._$centerPanel.append(this._$nextBtn);

      }

      this._$prevBtn.bind("click", {elem:this}, this.goBack).mousedown(preventDefault);
      this._$nextBtn.bind("click", {elem:this}, this.goFwd).mousedown(preventDefault);

      if (!this._contNav) {
        this._$slider.bind(UPDATE_BUTTONS,  function() {
          that._$prevBtn.toggleClass("off", that._index == 0);
          that._$nextBtn.toggleClass("off", that._index == that._$currList.data("numIndex") - 1);
        });
      }
    }
  }

  //init number info
  GridSlider.prototype.initNumInfo = function() {
    this._$numInfo = this._$cpanel.find(">.num-info");
    if (this._displayNumInfo) {
      var that = this;
      this.setNumInfoSize();
      this._$slider.bind(UPDATE_NUM, function() {
        var info = "";
        var total = that._$currList.data("numItems");
        if (total > 0) {
          var beg = that._index * that._numDisplay;
          var end = Math.min(beg + that._numDisplay, total);
          info = (beg + 1) + "-" + end + " of " + total;
        }
        that._$numInfo.html(info);
      });
    }
    else {
      this._$numInfo.remove();
    }
  }

  GridSlider.prototype.setNumInfoSize = function() {
    var arr = this._$lists.map(function() { return $(this).data("numItems"); }).get();
    var digits = getNumDigits(Math.max.apply(Math, arr));
    var str = "";
    for (var i = 0; i < digits; i++) {
      str += "0";
    }
    str += ("-" + str + " of " + str);
    this._$numInfo.html(str).width(this._$numInfo.width()).html("");
  }

  //init play button
  GridSlider.prototype.initPlay = function() {
    this._$playBtn = this._$cpanel.find(">.play-btn");
    if (this._displayPlayBtn) {
      var that = this;
      this._$playBtn.toggleClass("pause", this._rotate)
          .click(function() {
            that._rotate = !that._rotate;
            if (that._rotate) {
              that._$playBtn.addClass("pause");
              that.startTimer();
            }
            else {
              that._$playBtn.removeClass("pause");
              that.pauseTimer();
            }
            return false;
          });
    }
    else {
      this._$playBtn.remove();
    }
  }

  GridSlider.prototype.pause = function(e) {
    var that = e.data.elem;
    that._rotate = false;
    that._$playBtn.removeClass("pause");
    that.pauseTimer();
  }

  GridSlider.prototype.play = function(e) {
    var that = e.data.elem;
    that._rotate = true;
    that._$playBtn.addClass("pause");
    that.startTimer();
  }

  //init indexes
  GridSlider.prototype.initIndexes = function() {
    for (var i = 0; i < this._$lists.size(); i++) {
      var $list = this._$lists.eq(i);
      var n = $list.data("numIndex");
      if (n > 1) {
        var content = "<ul class='indexes'>";
        for (var j = 0; j < n; j++) {
          var beg = j * this._numDisplay;
          var end = Math.min(beg + this._numDisplay, $list.data("numItems"));
          content += "<li title='" + ((beg + 1) + "-" + end) + "'>" + (j+1) + "</li>";
        }
        content += "</ul>";
        this._$indexPanel.append(content);
        var $indexList = this._$indexPanel.find(">ul:last");
        var $indexes =   $indexList.find(">li");
        if (this._displayNum) {
          $indexes.addClass("num").last().css("border", "none");
        }
        else {
          $indexes.empty();
        }
        var that = this;
        $indexes.click(function() {
          that.resetTimer();
          that._index = $(this).index();
          that._$slider.trigger(UPDATE_TILES);
          return false;
        }).mousedown(preventDefault);

        var indexWidth = $indexes.outerWidth(true);
        $indexList.width($indexes.size() * indexWidth);
        if ($indexList.width() > this._$indexPanel.data("maxWidth")) {
          var width = Math.floor(this._$indexPanel.data("maxWidth")/indexWidth) * indexWidth;
          $indexList.data({width:width, range:width - $indexList.width()});
          this._$indexPanel.data("scroll", true);
        }
        else {
          $indexList.data({width:$indexList.width(), range:0});
        }
        $list.data("indexList", $indexList);
        $indexList.hide();
      }
    }
  }

  //init index scroll
  GridSlider.prototype.initIndexScroll = function() {
    this._$indexPanel.append("<div class='index-back'></div><div class='index-fwd'></div>");
    var $backScroll = this._$indexPanel.find(">.index-back");
    var $fwdScroll =  this._$indexPanel.find(">.index-fwd");
    if (this._$indexPanel.data("scroll")) {
      var that = this;
      if (!window.Touch) {
        $backScroll.hover(
            function() {
              $fwdScroll.show();
              var $indexList = that._$currList.data("indexList");
              var speed = -$indexList.stop(true).position().left * SCROLL_RATE;
              $indexList.stop(true).animate({left:0}, speed, "linear", function() { $backScroll.hide(); });
            },
            function() {
              that._$currList.data("indexList").stop(true);
            });
        $fwdScroll.hover(
            function() {
              $backScroll.show();
              var $indexList = that._$currList.data("indexList");
              var range = $indexList.data("range");
              var speed = (-range + $indexList.stop(true).position().left) * SCROLL_RATE;
              $indexList.stop(true).animate({left:range}, speed, "linear", function() { $fwdScroll.hide(); });
            },
            function() {
              that._$currList.data("indexList").stop(true);
            });
      }
      else {
        $backScroll.hide();
        $fwdScroll.hide();
      }

      this._$slider.bind(UPDATE_INDEX_LIST, function() {
        var $indexList = that._$currList.data("indexList");
        if(!$indexList.is(":animated")) {
          var size = $indexList.find(">li").outerWidth(true);
          var range = $indexList.data("range");
          var pos = $indexList.stop(true).position().left + (that._index * size);
          if (pos < 0 || pos > that._$indexPanel.width() - size) {
            $indexList.stop(true).animate({left:Math.max(-that._index * size, range)}, ANIMATE_SPEED,
                            function() {
                              if (!window.Touch) {
                                $(this).position().left == 0 ? $backScroll.hide() : $backScroll.show();
                                $(this).position().left == range ? $fwdScroll.hide() : $fwdScroll.show();
                              }
                            });
          }
        }
      });
    }
  }

  //switch indexes
  GridSlider.prototype.switchIndex = function(e) {
    var that = e.data.elem;
    that._$slider.unbind(UPDATE_INDEX);
    that._$indexPanel.find(">ul.indexes:visible").hide();
    if (that._$currList.data("multi")) {
      var $indexList = that._$currList.data("indexList");
      that._$indexPanel.width($indexList.data("width"));
      $indexList.show();
      if ($indexList.data("range") < 0) {
        that._$indexPanel.find(".index-back, .index-fwd").show();
      }
      else {
        that._$indexPanel.find(".index-back, .index-fwd").hide();
      }
      that._$slider.bind(UPDATE_INDEX, function() {
        var $indexes = $indexList.find(">li");
        $indexes.filter(".hl").removeClass("hl");
        $indexes.eq(that._index).addClass("hl");
      });
    }
  }

  //switch controls
  GridSlider.prototype.switchCtrls = function() {
    this._$slider.unbind(UPDATE_TILES);
    this._$slider.trigger(SWITCH_INDEX);
    if (this._$currList.data("multi")) {
      this._$centerPanel.show();
      this._$playBtn.show();
      if (this._displayButtons) {
        this._$prevBtn.show();
        this._$nextBtn.show();
      }
      this._$centerPanel.width(this._$indexPanel.width() + this._$centerPanel.find(">.s-prev").width() + this._$centerPanel.find(">.s-next").width()).css("marginLeft",-this._$centerPanel.width()/2);
      switch(EFFECTS[this._effect]) {
        case EFFECTS["h_slide"]:
          this._$slider.bind(UPDATE_TILES, {elem:this}, this.scrollHTiles);
          break;
        case EFFECTS["v_slide"]:
          this._$slider.bind(UPDATE_TILES, {elem:this}, this.scrollVTiles);
          break;
        case EFFECTS["fade"]:
          this._$slider.bind(UPDATE_TILES, {elem:this}, this.fadeTiles);
          break;
        default:
          this._$slider.bind(UPDATE_TILES, {elem:this}, this.showTiles);
      }
    }
    else {
      this._$centerPanel.hide();
      this._$playBtn.hide();
      if (this._displayButtons) {
        this._$prevBtn.hide();
        this._$nextBtn.hide();
      }
    }
  }

  //update controls
  GridSlider.prototype.updateCtrls = function() {
    this._$slider.trigger(UPDATE_BUTTONS).trigger(UPDATE_NUM).trigger(UPDATE_INDEX).trigger(UPDATE_INDEX_LIST);
  }

  //init content pane
  GridSlider.prototype.initOverlay = function() {
    if (this._displayOverlay) {
      var that = this;
      var content =  "<div class='content-overlay'>\
                <div class='content-bar'>\
                  <div class='content-prev'>&laquo;</div>\
                  <div class='content-num'></div>\
                  <div class='content-next'>&raquo;</div>\
                  <div class='content-close'></div>\
                </div>\
                <div class='content-frame'>\
                  <div class='outer-content'>\
                    <div class='inner-content'></div>\
                  </div>\
                  <div class='scrollbar'>\
                    <div class='thumb'></div>\
                  </div>\
                </div>\
              </div>";

      this._$mainBox.height($tileBox.height());
      var boxWidth = this._$mainBox.width();
      var boxHeight = this._$mainBox.height();
      $tileBox.css({width:boxWidth, height:boxHeight}).append("<div class='inner-cover'></div>").wrap("<div class='content-strip'></div>");
      var $strip = this._$mainBox.find(">.content-strip");
      switch(this._overlayDir) {
        case LEFT:
          $strip.css({width:2 * boxWidth, height:boxHeight, left:-boxWidth}).prepend(content);
          this.bindPaneMove("left", 0, -boxWidth);
          break;
        case RIGHT:
          $strip.css({width:2 * boxWidth, height:boxHeight}).append(content);
          this.bindPaneMove("left", -boxWidth, 0);
          break;
        case TOP:
          $strip.css({width:boxWidth, height:2 * boxHeight, top:-boxHeight}).prepend(content);
          this.bindPaneMove("top", 0, -boxHeight);
          break;
        default:
          $strip.css({width:boxWidth, height:2 * boxHeight}).append(content);
          this.bindPaneMove("top", -boxHeight, 0);
      }

      this._$overlay = $strip.find(">.content-overlay").css({width:boxWidth, height:boxHeight});
      //init content bar
      var $contentBar =   this._$overlay.find(">.content-bar").bind("click", {elem:this}, this.closeOverlay);
      var $prevPaneBtn =  $contentBar.find(">.content-prev").bind("click", {elem:this}, this.prevPane).mousedown(preventDefault);
      var $nextPaneBtn =  $contentBar.find(">.content-next").bind("click", {elem:this}, this.nextPane).mousedown(preventDefault);
      var $closeBtn =   $contentBar.find(">.content-close").bind("click", {elem:this}, this.closeOverlay);
      this._$contentNum = $contentBar.find(">.content-num").click(preventDefault);

      if (!this._contNav) {
        this._$slider.bind(UPDATE_PANE_BUTTONS, function() {
          $prevPaneBtn.toggleClass("off", that._paneIndex == 0);
          $nextPaneBtn.toggleClass("off", that._paneIndex == that._$currList.data("numItems") - 1);
        });
      }

      //init content frame
      this._$contentFrame = this._$overlay.find(">.content-frame");
      this._$outerContent = this._$contentFrame.find(">.outer-content");
      this._$innerContent = this._$outerContent.find(">.inner-content");
      this._$scrollbar =  this._$contentFrame.find(">.scrollbar");
      this._$thumb =    this._$scrollbar.find(">.thumb");

      this._frameHeight = this._$overlay.height() - (this._$contentFrame.outerHeight() - this._$contentFrame.height()) - $contentBar.outerHeight();
      this._$contentFrame.css({width:this._$overlay.width()  - (this._$contentFrame.outerWidth() - this._$contentFrame.width()), height:this._frameHeight});

      this._$thumb.click(preventDefault);
      try {
        this._$thumb.draggable({containment:"parent"})
            .bind("drag", function() { that._$innerContent.css({top:Math.round(-that._$thumb.position().top * that._$scrollbar.data("ratio"))}); });
      }
      catch (ex) {
        //not draggable.
      }

      this._$scrollbar.click(function(e) {
        var pct = Math.round(((e.pageY - that._$scrollbar.offset().top)/that._$scrollbar.height()) * 100)/100;
        var pos = -pct * that._$scrollbar.data("range");
        that._$innerContent.stop(true).animate({top:pos}, ANIMATE_SPEED);
        that._$thumb.stop(true).animate({top:-pos/that._$scrollbar.data("ratio")}, ANIMATE_SPEED);
        return false;
      });

      if (window.Touch) {
        var contentCoord = {start:0, end:0};
        var contentStart;
        this._$outerContent.bind("touchstart", function(e) {
          if (!that._$innerContent.is(":animated")) {
            contentCoord.start = e.originalEvent.touches[0].pageY;
            contentStart = that._$innerContent.position().top;
          }
        })
        .bind("touchmove", function(e) {
          e.preventDefault();
          var swipeBy = contentCoord.start - e.originalEvent.touches[0].pageY;
          var yPos = contentStart - swipeBy;
          var range = -that._$scrollbar.data("range");
          if (yPos > 0) {
            yPos = 0;
          }
          else if (yPos < range) {
            yPos = range;
          }
          that._$innerContent.css("top", yPos);
          that._$thumb.css("top", -yPos/that._$scrollbar.data("ratio"));
        })
        .bind("touchend", function() {
          contentCoord.start = contentCoord.end = 0;
        });
      }
      else if (this._mousewheelScroll) {
        var scrollDist = Math.round(this._frameHeight/2);
        this._$contentFrame.bind("mousewheel", {elem:this, distance:scrollDist}, this.scrollContent)
                   .bind("DOMMouseScroll", {elem:this, distance:scrollDist}, this.scrollContent);
      }
    }
  }

  GridSlider.prototype.scrollContent = function(e) {
    var that = e.data.elem;
    var range = -that._$scrollbar.data("range");
    if (range < 0) {
      if (!that._$innerContent.is(":animated")) {
        that._$innerContent.stop(true);
        var pos;
        var delta = (typeof e.originalEvent.wheelDelta == "undefined") ?  -e.originalEvent.detail : e.originalEvent.wheelDelta;
        var scrollDist = e.data.distance;
        if (delta > 0) {
          pos = Math.min(0, that._$innerContent.position().top + scrollDist);
        }
        else {
          pos = Math.max(range, that._$innerContent.position().top - scrollDist);
        }
        that._$innerContent.animate({top:pos}, ANIMATE_SPEED);
        that._$thumb.stop(true).animate({top:-pos/that._$scrollbar.data("ratio")}, ANIMATE_SPEED);
      }
    }
    return false;
  }

  //bind open/close pane
  GridSlider.prototype.bindPaneMove = function(dir, openPos, closePos) {
    var $cover = $tileBox.find(">.inner-cover").css("opacity",0).click(preventDefault);
    var $strip = this._$mainBox.find(">.content-strip");
    var that = this;
    var openProp = {};
    openProp[dir] = openPos;
    var closeProp = {};
    closeProp[dir] = closePos;

    this._$slider.bind(OPEN_PANE, function() {
      $cover.show().stop(true).animate({opacity:1}, ANIMATE_SPEED);
      $strip.stop(true, true).animate(openProp, ANIMATE_SPEED, that._easing);
    }).bind(CLOSE_PANE, function() {
      $cover.stop(true).animate({opacity:0}, ANIMATE_SPEED);
      $strip.stop(true, true).animate(closeProp, ANIMATE_SPEED, that._easing, function() { $cover.hide(); });
    });
  }

  //open overlay
  GridSlider.prototype.openOverlay = function(e) {
    var that = e.data.elem;
    that.pauseTimer();
    that._paneIndex = e.data.i;
    that._numPanes = that._$currList.data("numItems");
    that.gotoPane(that._paneIndex);
    that._$slider.trigger(OPEN_PANE);
    that._$cpanel.stop(true,true).fadeOut(ANIMATE_SPEED);
    that._$prevBtn.css("visibility", "hidden");
    that._$nextBtn.css("visibility", "hidden");
    return false;
  }

  //close overlay
  GridSlider.prototype.closeOverlay = function(e) {
    var that = e.data.elem;
    that.startTimer();
    that._$slider.trigger(CLOSE_PANE);
    that._$innerContent.stop(true).animate({opacity:0}, ANIMATE_SPEED);
    that._$cpanel.stop(true,true).fadeIn(ANIMATE_SPEED);
    that._$prevBtn.css("visibility", "visible");
    that._$nextBtn.css("visibility", "visible");
    return false;
  }

  //go to pane
  GridSlider.prototype.gotoPane = function(i) {
    this._$thumb.stop(true).css("top", 0);
    this._$innerContent.stop(true).css({opacity:0, top:0});
    this._$contentNum.html((i + 1) + "/" + this._numPanes);
    var $item = this._$currList.data("items").eq(i);
    this.getContent($item);
    var innerHeight = this._$innerContent.height();
    if (innerHeight > this._frameHeight) {
      this._$outerContent.width(this._$contentFrame.width() - this._$scrollbar.outerWidth(true));
      this._$scrollbar.show();
      this._$thumb.css({height:Math.round((this._frameHeight/innerHeight) * this._$scrollbar.height())});
      var range = innerHeight - this._frameHeight;
      this._$scrollbar.data({ratio:range/(this._$scrollbar.height() - this._$thumb.height()), range:range});
    }
    else {
      this._$scrollbar.hide();
      this._$outerContent.width(this._$contentFrame.width());
      this._$scrollbar.data("range", 0);
    }

    this._$slider.trigger(UPDATE_PANE_BUTTONS);
  }

  //go to prev pane
  GridSlider.prototype.prevPane = function(e) {
    var that = e.data.elem;
    if (that._paneIndex > 0) {
      that._paneIndex--;
    }
    else if (that._contNav) {
      that._paneIndex = that._numPanes - 1;
    }
    else {
      return false;
    }
    that.gotoPane(that._paneIndex);
    return false;
  }

  //go to next pane
  GridSlider.prototype.nextPane = function(e) {
    var that = e.data.elem;
    if (that._paneIndex < that._numPanes - 1) {
      that._paneIndex++;
    }
    else if (that._contNav) {
      that._paneIndex = 0;
    }
    else {
      return false;
    }
    that.gotoPane(that._paneIndex);
    return false;
  }

  //get overlay content
  GridSlider.prototype.getContent = function($item) {
    var type = $item.data("type");
    this._$outerContent.removeClass("loading");
    if (type == "static") {
      this._$innerContent.html($item.find(">.content").html()).animate({opacity:1}, ANIMATE_SPEED);
      return;
    }

    var url =  $item.data("url");
    var newUrl = url;
    var index = url.indexOf("?");
    if (index >= 0) {
      newUrl = url.substring(0, index);
    }
    if (type == "inline") {
      var $inline = $(newUrl);
      if ($inline.size() > 0) {
        this._$innerContent.html($inline.html()).animate({opacity:1}, ANIMATE_SPEED);
      }
      else {
        this.displayError();
      }
    }
    else if (type == "ajax") {
      var that = this;
      var varData = (index >= 0) ? url.substring(index + 1) : "";
      this._$outerContent.addClass("loading");
      $.ajax({url:newUrl, type:this._formMethod, data:varData,
        success:function(data) {
          that._$innerContent.html(data).animate({opacity:1}, ANIMATE_SPEED);
          that._$outerContent.removeClass("loading");
        },
        error:function() {
          that.displayError();
        }
      });
    }
    else if (type == "flash") {
      var content =  "<object type='application/x-shockwave-flash' data='" + url + "' width='100%' height='100%'>\
                <param name='movie' value='" + url + "'/>\
                <param name='allowFullScreen' value='true'/>\
                <param name='quality' value='high'/>\
                <param name='wmode' value='transparent'/>\
                <a href='http://www.adobe.com/go/getflash'><img src='http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash player'/></a>\
              </object>";
      this._$innerContent.html(content).animate({opacity:1}, ANIMATE_SPEED);
    }
    else {
      var that = this;
      this._$outerContent.addClass("loading");
      var $iframe = $("<iframe frameborder='0' hspace='0' scrolling='auto' width='" + this._$contentFrame.width() + "' height='" + this._$contentFrame.height() + "'></iframe>");
      this._$innerContent.html($iframe).animate({opacity:1}, ANIMATE_SPEED);
      $iframe.load(function() { that._$outerContent.removeClass("loading"); }).attr("src", url);
    }
  }

  //display error message
  GridSlider.prototype.displayError = function() {
    this._$outerContent.removeClass("loading");
    this._$innerContent.html(ERROR_MSG).animate({opacity:1}, ANIMATE_SPEED);
  }

  //set category
  GridSlider.prototype.changeCategory = function(i) {
    this.resetTimer();
    if (i != this._catIndex) {
      this._$lists.eq(this._catIndex).stop(true,true).data("index", this._index).css("zIndex", 0);
    }

    this._catIndex = i;
    try {
      this._$menuItems.filter(".selected").removeClass("selected");
      this._$menuItems.eq(this._catIndex).addClass("selected");
    }
    catch(ex) {};

    this._$currList = this._$lists.eq(this._catIndex);
    if (!this._$currList.data("init")) {
      this.initList(this._$currList.index());
    }
    this._index = this._$currList.data("index");

    if (this._effect == "none") {
      this._$lists.not(":eq(" + this._$currList.index() + ")").css("opacity", 0);
      this._$currList.css("zIndex", 1).css("opacity", 1);
    }
    else {
      var that = this;
      this._$currList.css("zIndex", 1).stop(true,true).animate({opacity:1}, ANIMATE_SPEED, function() { that._$lists.not(":eq(" + $(this).index() + ")").css("opacity", 0); });
    }

    this.switchCtrls();
    this.updateCtrls();

    this.startTimer();
  }

  //move tiles back
  GridSlider.prototype.goBack = function(e) {
    var that = (typeof e != "undefined") ? e.data.elem : this;
    if (that._index > 0) {
      that._index--;
    }
    else if (that._contNav) {
      that._index = that._$currList.data("numIndex") - 1;
    }
    else {
      return;
    }
    that.resetTimer();
    that._$slider.trigger(UPDATE_TILES);
  }

  //move tiles forward
  GridSlider.prototype.goFwd = function(e) {
    var that = (typeof e != "undefined") ? e.data.elem : this;
    if (that._index < that._$currList.data("numIndex") - 1) {
      that._index++;
    }
    else if (that._contNav) {
      that._index = 0;
    }
    else {
      return;
    }
    that.resetTimer();
    that._$slider.trigger(UPDATE_TILES);
  }

  //show tiles
  GridSlider.prototype.showTiles = function(e) {
    var that = e.data.elem;
    var $subItems = that._$currList.find(">li.sub");
    $subItems.css({opacity:0, zIndex:0});
    $subItems.eq(that._index).css({opacity:1, zIndex:1});
    that.startTimer();
    that.updateCtrls();
  }

  //fade tiles
  GridSlider.prototype.fadeTiles = function(e) {
    var that = e.data.elem;
    var $subItems = that._$currList.find(">li.sub");
    $subItems.css("zIndex",0).stop(true,true);
    $subItems.eq(that._index).css({opacity:0, zIndex:1, visibility:"visible"}).stop(true,true).animate({opacity:1}, that._duration, that._easing,
                          function() {
                            $subItems.not(":eq(" + $(this).index() + ")").css("visibility", "hidden");
                            that.startTimer();
                          });
    that.updateCtrls();
  }

  //scroll tiles horizontal
  GridSlider.prototype.scrollHTiles = function(e) {
    var that = e.data.elem;
    that._$currList.stop(true, true).animate({left:-that._index * that._unitW}, that._duration, that._easing, function() { that.startTimer(); });
    that.updateCtrls();
  }

  //scroll tiles vertical
  GridSlider.prototype.scrollVTiles = function(e) {
    var that = e.data.elem;
    that._$currList.stop(true, true).animate({top:-that._index * that._unitH}, that._duration, that._easing, function() { that.startTimer(); });
    that.updateCtrls();
  }

  //process loaded image size & position
  GridSlider.prototype.processLoadedImg = function(e) {
    var that = e.data.elem;
    that.processImg($(this));
  }

  //process image
  GridSlider.prototype.processImg = function($img) {
    if (this._autoScale) {
      var sizeRatio = $img.height()/$img.width();
      $img.css({width:this._tileWidth, height:sizeRatio * this._tileWidth});
      if ($img.height() > this._tileHeight) {
        sizeRatio = 1/sizeRatio;
        $img.css({width:sizeRatio * this._tileHeight, height:this._tileHeight});
      }
    }

    if (this._autoCenter) {
      $img.css({left:this._extX + Math.round((this._tileWidth - $img.width())/2), top:this._extY + Math.round((this._tileHeight - $img.height())/2)});
    }
    else {
      $img.css({left:this._extX, top:this._extY});
    }
  }

  //item mouseover
  GridSlider.prototype.itemMouseover = function() {
    $(this).data("image").stop(true).animate({opacity:TILE_OPACITY}, ANIMATE_SPEED);
  }

  //item mouseout
  GridSlider.prototype.itemMouseout = function() {
    $(this).data("image").stop(true).animate({opacity:1}, ANIMATE_SPEED,
      function() {
        if (jQuery.browser.msie) {
          this.style.removeAttribute('filter');
        }
      });
  }

  //start timer
  GridSlider.prototype.startTimer = function() {
    if (this._rotate && this._timerId == null && this._$currList.data("multi")) {
      var that = this;
      var timerDelay = Math.round(this._$timer.data("pct") * this._delay);
      this._$timer.stop(true).animate({width:0}, timerDelay, "linear");
      this._timerId = setTimeout(function() {
        that.resetTimer();
        that._index = that._index < that._$currList.data("numIndex") - 1 ? that._index + 1 : 0;
        that._$slider.trigger(UPDATE_TILES);
      }, timerDelay);
    }
  }

  //pause timer
  GridSlider.prototype.pauseTimer = function() {
    clearTimeout(this._timerId);
    this._timerId = null;
    this._$timer.stop(true).data("pct", this._$timer.width()/this._$cpanel.width());
  }

  //reset timer
  GridSlider.prototype.resetTimer = function() {
    clearTimeout(this._timerId);
    this._timerId = null;
    this._$timer.stop(true).width("100%").data("pct", 1);
  }

  //shuffle items
  GridSlider.prototype.shuffleItems = function($list) {
    var $items = $list.find(">li");
    var numItems = $items.size();
    var $arr = $items.toArray();
    for (var i = 0; i < numItems; i++) {
      var ri = Math.floor(Math.random() * numItems);
      var $temp = $arr[i];
      $arr[i] = $arr[ri];
      $arr[ri] = $temp;
    }

    for (var i = 0; i < numItems; i++) {
      $list.append($arr[i]);
    }

    return $list.find(">li");
  }

  GridSlider.prototype.setNoCategory = function() {
    var $list = this._$lists.eq(0);
    for (var i = 1; i < this._$lists.size(); i++) {
      var $tmpList = this._$lists.eq(i);
      $list.append($tmpList.find(">li"));
      $tmpList.remove();
    }
    this._$lists = this._$tilePanel.find(">ul");
    this._$tiles = this._$lists.find(">li");
  }

  //mousewheel scroll list
  GridSlider.prototype.mousewheelScroll = function(e) {
    var that = e.data.elem;
    if (!that._$currList.is(":animated")) {
      var delta = (typeof e.originalEvent.wheelDelta == "undefined") ?  -e.originalEvent.detail : e.originalEvent.wheelDelta;
      delta > 0 ? that.goBack() : that.goFwd();
    }
    return false;
  }

  GridSlider.prototype.touchStart = function(e) {
    e.data.elem._slideCoord.start = e.originalEvent.touches[0].pageX;
  }

  GridSlider.prototype.touchMove = function(e) {
    e.preventDefault();
    e.data.elem._slideCoord.end = e.originalEvent.touches[0].pageX;
  }

  GridSlider.prototype.touchVStart = function(e) {
    e.data.elem._slideCoord.start = e.originalEvent.touches[0].pageY;
  }

  GridSlider.prototype.touchVMove = function(e) {
    e.preventDefault();
    e.data.elem._slideCoord.end = e.originalEvent.touches[0].pageY;
  }

  GridSlider.prototype.touchEnd = function (e) {
    var that = e.data.elem;
    if (that._slideCoord.end >= 0) {
      if (Math.abs(that._slideCoord.start - that._slideCoord.end) > SWIPE_MIN) {
        if (that._slideCoord.end < that._slideCoord.start) {
          that.swipeFwd();
        }
        else {
          that.swipeBack();
        }
      }
    }
    that._slideCoord.start = that._slideCoord.end = -1;
  }

  GridSlider.prototype.swipeBack = function() {
    if (this._index > 0) {
      this._index--;
      this.resetTimer();
      this._$slider.trigger(UPDATE_TILES);
    }
  }

  GridSlider.prototype.swipeFwd = function() {
    if (this._index < this._$currList.data("numIndex") - 1) {
      this._index++;
      this.resetTimer();
      this._$slider.trigger(UPDATE_TILES);
    }
  }

  //get type of content
  GridSlider.prototype.getContentType = function($link) {
    var rel = $link.attr("rel");
    if (typeof rel != "undefined") {
      rel = rel.toLowerCase();
      if (rel == "flash" || rel == "inline" || rel == "iframe" || rel == "ajax") {
        return rel;
      }
    }

    var url = $link.attr("href");
    if (typeof url != "undefined") {
      if (url.match(SWF_RE)) {
        return "flash";
      }
      if (url.indexOf("#") == 0) {
        return "inline";
      }
    }
    return "iframe";
  }

  //prevent default behavior
  function preventDefault() {
    return false;
  }

  //get positive number
  function getPosNumber(val, defaultVal) {
    if (!isNaN(val) && val > 0) {
      return val;
    }
    return defaultVal;
  }

  //get nonnegative number
  function getNonNegNumber(val, defaultVal) {
    if (!isNaN(val) && val >= 0) {
      return val;
    }
    return defaultVal;
  }

  //get number of digits
  function getNumDigits(num) {
    var count = 1;
    num = Math.abs(num);
    num = parseInt(num/10);
    while(num > 0) {
      count++;
      num = parseInt(num/10);
    }
    return count;
  }

  $.fn.gridSlider = function(params) {
    var defaults = {
      num_cols:4,
      num_rows:2,
      tile_width:225,
      tile_height:150,
      tile_margin:6,
      tile_border:1,
      margin:10,
      auto_scale:true,
      auto_center:true,
      auto_rotate:false,
      delay:DEFAULT_DELAY,
      mouseover_pause:false,
      effect:"h_slide",
      duration:DEFAULT_DURATION,
      easing:"",
      display_panel:true,
      panel_direction:BOTTOM,
      display_timer:true,
      display_dbuttons:true,
      mouseover_dbuttons:true,
      display_numinfo:true,
      display_index:true,
      display_number:true,
      display_play:true,
      display_caption:true,
      mouseover_caption:true,
      caption_effect:"fade",
      caption_align:BOTTOM,
      caption_position:INSIDE,
      caption_width:0,
      caption_height:0,
      cont_nav:true,
      shuffle:false,
      category_index:0,
      multi_category:true,
      mousewheel_scroll:true,
      type:"GET"
    };

    var opts = $.extend(true, {}, defaults, params);
    return this.each(
      function() {
        var slider = new GridSlider($(this), opts);
      }
    );
  }
})(jQuery);