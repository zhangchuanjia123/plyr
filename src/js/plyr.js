// ==========================================================================
// Plyr
// plyr.js v3.0.0
// https://github.com/sampotts/plyr
// License: The MIT License (MIT)
// ==========================================================================

(function(name, context, definition) {
    /* global define,module,require,YUI */
    'use strict';

    if (typeof exports === 'object') {
        module.exports = definition(require);
    } else if (typeof define === 'function' && define.amd) {
        define(definition);
    } else {
        context[name] = definition();
    }
}).call(this, 'Plyr', this, function(require) {
    'use strict';
    /* global jQuery, console */

    // Globals
    var scroll = {
        x: 0,
        y: 0
    };

    // Default config
    var defaults = {
        enabled: true,
        title: '',
        debug: false,
        autoplay: false,
        seekTime: 10,
        volume: 10,
        duration: null,
        displayDuration: true,
        loadSprite: true,
        iconPrefix: 'plyr',
        iconUrl: 'https://cdn.plyr.io/2.0.10/plyr.svg',
        clickToPlay: true,
        hideControls: true,
        showPosterOnEnd: false,
        disableContextMenu: true,

        // Selectors
        // Change these to match your template if using custom HTML
        selectors: {
            editable: 'input, textarea, select, [contenteditable]',
            container: '.plyr',
            controls: {
                container: null,
                wrapper: '.plyr__controls'
            },
            labels: '[data-plyr]',
            buttons: {
                play: '[data-plyr="play"]',
                pause: '[data-plyr="pause"]',
                restart: '[data-plyr="restart"]',
                rewind: '[data-plyr="rewind"]',
                forward: '[data-plyr="fast-forward"]',
                mute: '[data-plyr="mute"]',
                captions: '[data-plyr="captions"]',
                fullscreen: '[data-plyr="fullscreen"]',
                pip: '[data-plyr="pip"]',
                airplay: '[data-plyr="airplay"]',
                settings: '[data-plyr="settings"]',
                loop: '[data-plyr="loop"]'
            },
            inputs: {
                seek: '[data-plyr="seek"]',
                volume: '[data-plyr="volume"]',
                speed: '[data-plyr="speed"]',
                language: '[data-plyr="language"]',
                quality: '[data-plyr="quality"]'
            },
            display: {
                currentTime: '.plyr__time--current',
                duration: '.plyr__time--duration',
                buffer: '.plyr__progress--buffer',
                played: '.plyr__progress--played',
                loop: '.plyr__progress--loop',
                volume: '.plyr__volume--display',
            },
            progress: '.plyr__progress',
            captions: '.plyr__captions',
            menu: {
                quality: '.js-plyr__menu__list--quality'
            }
        },

        // Class hooks added to the player in different states
        classes: {
            video: 'plyr__video-wrapper',
            embed: 'plyr__video-embed',
            control: 'plyr__control',
            type: 'plyr--{0}',
            stopped: 'plyr--stopped',
            playing: 'plyr--playing',
            muted: 'plyr--muted',
            loading: 'plyr--loading',
            hover: 'plyr--hover',
            tooltip: 'plyr__tooltip',
            hidden: 'plyr__sr-only',
            hideControls: 'plyr--hide-controls',
            isIos: 'plyr--is-ios',
            isTouch: 'plyr--is-touch',
            menu: {
                value: 'plyr__menu__value',
                badge: 'plyr__badge'
            },
            captions: {
                enabled: 'plyr--captions-enabled',
                active: 'plyr--captions-active'
            },
            fullscreen: {
                enabled: 'plyr--fullscreen-enabled',
                active: 'plyr--fullscreen-active'
            },
            pip: {
                enabled: 'plyr--pip-enabled',
                active: 'plyr--pip-active'
            },
            airplay: {
                enabled: 'plyr--airplay-enabled',
                active: 'plyr--airplay-active'
            },
            tabFocus: 'tab-focus'
        },

        // Quality settings
        quality: {
            selected: 'auto',
            options: []
        },

        // Set loops
        loop: {
            active: false,
            start: 0,
            end: null,
            indicator: {
                start: 0,
                end: 0
            }
        },

        // Speed up/down
        speed: {
            selected: 1,
            options: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]
        },

        // Keyboard shortcut settings
        keyboard: {
            focused: true,
            global: false
        },

        // Display tooltips
        tooltips: {
            controls: false,
            seek: true
        },

        // Captions settings
        captions: {
            active: false,
            language: window.navigator.language.split("-")[0]
        },

        // Fullscreen settings
        fullscreen: {
            enabled: true,
            fallback: true,
            allowAudio: false
        },

        // Local storage
        storage: {
            enabled: true,
            key: 'plyr'
        },

        // Default controls
        controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'captions',
            'settings',
            'pip',
            'airplay',
            'fullscreen'
        ],
        settings: [
            'captions',
            'quality',
            'speed',
            'loop'
        ],

        // Localisation
        i18n: {
            restart: 'Restart',
            rewind: 'Rewind {seektime} secs',
            play: 'Play',
            pause: 'Pause',
            forward: 'Forward {seektime} secs',
            seek: 'Seek',
            played: 'Played',
            buffered: 'Buffered',
            currentTime: 'Current time',
            duration: 'Duration',
            volume: 'Volume',
            toggleMute: 'Toggle Mute',
            toggleCaptions: 'Toggle Captions',
            toggleFullscreen: 'Toggle Fullscreen',
            frameTitle: 'Player for {title}',
            captions: 'Captions',
            settings: 'Settings',
            speed: 'Speed',
            quality: 'Quality',
            loop: 'Loop',
            start: 'Start',
            end: 'End',
            all: 'All',
            reset: 'Reset',
            none: 'None'
        },

        // URLs
        urls: {
            vimeo: {
                api: 'https://player.vimeo.com/api/player.js',
            },
            youtube: {
                api: 'https://www.youtube.com/iframe_api'
            },
            soundcloud: {
                api: 'https://w.soundcloud.com/player/api.js'
            }
        },

        // Custom control listeners
        listeners: {
            seek: null,
            play: null,
            pause: null,
            restart: null,
            rewind: null,
            forward: null,
            mute: null,
            volume: null,
            captions: null,
            fullscreen: null,
            pip: null,
            airplay: null,
            speed: null,
            quality: null,
            loop: null,
            language: null
        },

        // Events to watch on HTML5 media elements and bubble
        // https://developer.mozilla.org/en/docs/Web/Guide/Events/Media_events
        events: [
            'ended',
            'progress',
            'stalled',
            'playing',
            'waiting',
            'canplay',
            'canplaythrough',
            'loadstart',
            'loadeddata',
            'loadedmetadata',
            'timeupdate',
            'volumechange',
            'play',
            'pause',
            'error',
            'seeking',
            'seeked',
            'emptied'
        ],

        // Logging
        logPrefix: ''
    };

    // Types
    var types = {
        embed: ['youtube', 'vimeo', 'soundcloud'],
        html5: ['video', 'audio']
    };

    // Utilities
    var utils = {
        // Check variable types
        is: {
            object: function(input) {
                return input !== null && typeof(input) === 'object' && input.constructor === Object;
            },
            array: function(input) {
                return input !== null && Array.isArray(input);
            },
            number: function(input) {
                return input !== null && (typeof(input) === 'number' && !isNaN(input - 0) || (typeof input === 'object' && input.constructor === Number));
            },
            string: function(input) {
                return input !== null && (typeof input === 'string' || (typeof input === 'object' && input.constructor === String));
            },
            boolean: function(input) {
                return input !== null && typeof input === 'boolean';
            },
            nodeList: function(input) {
                return input !== null && input instanceof NodeList;
            },
            htmlElement: function(input) {
                return input !== null && input instanceof HTMLElement;
            },
            function: function(input) {
                return input !== null && typeof input === 'function';
            },
            event: function(input) {
                return input !== null && input instanceof Event;
            },
            cue: function(input) {
                return input !== null && (input instanceof window.TextTrackCue || input instanceof window.VTTCue);
            },
            track: function(input) {
                return input !== null && input instanceof window.TextTrack;
            },
            undefined: function(input) {
                return input !== null && typeof input === 'undefined';
            },
            empty: function(input) {
                return input === null || this.undefined(input) || ((this.string(input) || this.array(input) || this.nodeList(input)) && input.length === 0) || (this.object(input) && Object.keys(input).length === 0);
            }
        },

        // Credits: http://paypal.github.io/accessible-html5-video-player/
        // Unfortunately, due to mixed support, UA sniffing is required
        getBrowser: function() {
            var ua = navigator.userAgent;
            var name = navigator.appName;
            var fullVersion = '' + parseFloat(navigator.appVersion);
            var majorVersion = parseInt(navigator.appVersion, 10);
            var nameOffset;
            var verOffset;
            var ix;
            var isIE = false;
            var isFirefox = false;
            var isChrome = false;
            var isSafari = false;

            if ((navigator.appVersion.indexOf('Windows NT') !== -1) && (navigator.appVersion.indexOf('rv:11') !== -1)) {
                // MSIE 11
                isIE = true;
                name = 'IE';
                fullVersion = '11';
            } else if ((verOffset = ua.indexOf('MSIE')) !== -1) {
                // MSIE
                isIE = true;
                name = 'IE';
                fullVersion = ua.substring(verOffset + 5);
            } else if ((verOffset = ua.indexOf('Chrome')) !== -1) {
                // Chrome
                isChrome = true;
                name = 'Chrome';
                fullVersion = ua.substring(verOffset + 7);
            } else if ((verOffset = ua.indexOf('Safari')) !== -1) {
                // Safari
                isSafari = true;
                name = 'Safari';
                fullVersion = ua.substring(verOffset + 7);

                if ((verOffset = ua.indexOf('Version')) !== -1) {
                    fullVersion = ua.substring(verOffset + 8);
                }
            } else if ((verOffset = ua.indexOf('Firefox')) !== -1) {
                // Firefox
                isFirefox = true;
                name = 'Firefox';
                fullVersion = ua.substring(verOffset + 8);
            } else if ((nameOffset = ua.lastIndexOf(' ') + 1) < (verOffset = ua.lastIndexOf('/'))) {
                // In most other browsers, 'name/version' is at the end of userAgent
                name = ua.substring(nameOffset, verOffset);
                fullVersion = ua.substring(verOffset + 1);

                if (name.toLowerCase() === name.toUpperCase()) {
                    name = navigator.appName;
                }
            }

            // Trim the fullVersion string at semicolon/space if present
            if ((ix = fullVersion.indexOf(';')) !== -1) {
                fullVersion = fullVersion.substring(0, ix);
            }
            if ((ix = fullVersion.indexOf(' ')) !== -1) {
                fullVersion = fullVersion.substring(0, ix);
            }

            // Get major version
            majorVersion = parseInt('' + fullVersion, 10);
            if (isNaN(majorVersion)) {
                fullVersion = '' + parseFloat(navigator.appVersion);
                majorVersion = parseInt(navigator.appVersion, 10);
            }

            // Return data
            return {
                name: name,
                version: majorVersion,
                isIE: isIE,
                isOldIE: (isIE && majorVersion <= 9),
                isFirefox: isFirefox,
                isChrome: isChrome,
                isSafari: isSafari,
                isIPhone: /(iPhone|iPod)/gi.test(navigator.platform),
                isIos: /(iPad|iPhone|iPod)/gi.test(navigator.platform)
            };
        },

        // Check for support
        // Basic functionality vs full UI
        checkSupport: function(type, inline) {
            var basic = false;
            var full = false;
            var browser = utils.getBrowser();
            var playsInline = (browser.isIPhone && inline && support.inline);

            switch (type) {
                case 'video':
                    basic = support.video;
                    full = basic && !browser.isOldIE && (!browser.isIPhone || playsInline);
                    break;

                case 'audio':
                    basic = support.audio;
                    full = basic && !browser.isOldIE;
                    break;

                case 'youtube':
                    basic = support.video;
                    full = basic && !browser.isOldIE && (!browser.isIPhone || playsInline);
                    break;

                case 'vimeo':
                case 'soundcloud':
                    basic = true;
                    full = (!browser.isOldIE && !browser.isIos);
                    break;

                default:
                    basic = (support.audio && support.video);
                    full = (basic && !browser.isOldIE);
            }

            return {
                basic: basic,
                full: full
            };
        },

        // Inject a script
        injectScript: function(url) {
            // Check script is not already referenced
            if (document.querySelectorAll('script[src="' + url + '"]').length) {
                return;
            }

            var tag = document.createElement('script');
            tag.src = url;

            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        },

        // Determine if we're in an iframe
        inFrame: function() {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        },

        // Element exists in an array
        inArray: function(haystack, needle) {
            return utils.is.array(haystack) && haystack.indexOf(needle) !== -1;
        },

        // Replace all
        replaceAll: function(string, find, replace) {
            return string.replace(new RegExp(find.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1'), 'g'), replace);
        },

        // Wrap an element
        wrap: function(elements, wrapper) {
            // Convert `elements` to an array, if necessary.
            if (!elements.length) {
                elements = [elements];
            }

            // Loops backwards to prevent having to clone the wrapper on the
            // first element (see `child` below).
            for (var i = elements.length - 1; i >= 0; i--) {
                var child = (i > 0) ? wrapper.cloneNode(true) : wrapper;
                var element = elements[i];

                // Cache the current parent and sibling.
                var parent = element.parentNode;
                var sibling = element.nextSibling;

                // Wrap the element (is automatically removed from its current
                // parent).
                child.appendChild(element);

                // If the element had a sibling, insert the wrapper before
                // the sibling to maintain the HTML structure; otherwise, just
                // append it to the parent.
                if (sibling) {
                    parent.insertBefore(child, sibling);
                } else {
                    parent.appendChild(child);
                }

                return child;
            }
        },

        // Remove an element
        removeElement: function(element) {
            if (!utils.is.htmlElement(element) ||
                !utils.is.htmlElement(element.parentNode)) {
                return;
            }

            element.parentNode.removeChild(element);
        },

        // Prepend child
        prependChild: function(parent, element) {
            parent.insertBefore(element, parent.firstChild);
        },

        // Inaert an element after another
        insertAfter: function(element, target) {
            target.parentNode.insertBefore(element, target.nextSibling);
        },

        // Create a DocumentFragment
        createElement: function(type, attributes, text) {
            // Create a new <element>
            var element = document.createElement(type);

            // Set all passed attributes
            if (utils.is.object(attributes)) {
                utils.setAttributes(element, attributes);
            }

            // Add text node
            if (utils.is.string(text)) {
                element.textContent = text;
            }

            // Return built element
            return element;
        },

        // Insert a DocumentFragment
        insertElement: function(type, parent, attributes, text) {
            // Create a new <element>
            var element = utils.createElement(type, attributes, text);

            // Inject the new element
            utils.prependChild(parent, element);
        },

        // Remove all child elements
        emptyElement: function(element) {
            var length = element.childNodes.length;
            while (length--) {
                element.removeChild(element.lastChild);
            }
        },

        // Set attributes
        setAttributes: function(element, attributes) {
            for (var key in attributes) {
                element.setAttribute(key, attributes[key]);
            }
        },

        // Get an attribute object from a string selector
        getAttributesFromSelector: function(selector, existingAttributes) {
            // For example:
            // '.test' to { class: 'test' }
            // '#test' to { id: 'test' }
            // '[data-test="test"]' to { 'data-test': 'test' }

            if (!utils.is.string(selector) || utils.is.empty(selector)) {
                return {};
            }

            var attributes = {};

            selector.split(',').forEach(function(selector) {
                // Remove whitespace
                selector = selector.trim();

                // Get the first character
                var start = selector.charAt(0);

                switch (start) {
                    case '.':
                        // Classname selector
                        var className = selector.replace('.', '');

                        // Add to existing classname
                        if (utils.is.object(existingAttributes) && utils.is.string(existingAttributes.class)) {
                            existingAttributes.class += ' ' + className;
                        }

                        attributes.class = className;
                        break;

                    case '#':
                        // ID selector
                        attributes.id = selector.replace('#', '');
                        break;

                    case '[':
                        // Strip the []
                        selector = selector.replace(/[\[\]]/g, '');

                        // Get the parts if
                        var parts = selector.split('=');
                        var key = parts[0];

                        // Get the value if provided
                        var value = parts.length > 1 ? parts[1].replace(/[\"\']/g, '') : '';

                        // Attribute selector
                        attributes[key] = value;

                        break;
                }
            });

            return attributes;
        },

        // Toggle class on an element
        toggleClass: function(element, className, state) {
            if (element) {
                if (element.classList) {
                    element.classList[state ? 'add' : 'remove'](className);
                } else {
                    var name = (' ' + element.className + ' ').replace(/\s+/g, ' ').replace(' ' + className + ' ', '');
                    element.className = name + (state ? ' ' + className : '');
                }
            }
        },

        // Has class name
        hasClass: function(element, className) {
            if (element) {
                if (element.classList) {
                    return element.classList.contains(className);
                } else {
                    return new RegExp('(\\s|^)' + className + '(\\s|$)').test(element.className);
                }
            }
            return false;
        },

        // Element matches selector
        matches: function(element, selector) {
            var prototype = Element.prototype;

            var matches = prototype.matches ||
                prototype.webkitMatchesSelector ||
                prototype.mozMatchesSelector ||
                prototype.msMatchesSelector ||
                function(selector) {
                    return [].indexOf.call(document.querySelectorAll(selector), this) !== -1;
                };

            return matches.call(element, selector);
        },

        // Get the focused element
        getFocusElement: function() {
            var focused = document.activeElement;

            if (!focused || focused === document.body) {
                focused = null;
            } else {
                focused = document.querySelector(':focus');
            }

            return focused;
        },

        // Bind along with custom handler
        proxy: function(element, eventName, customListener, defaultListener, passive, capture) {
            utils.on(element, eventName, function(event) {
                if (customListener) {
                    customListener.apply(element, [event]);
                }
                defaultListener.apply(element, [event]);
            }, passive, capture);
        },

        // Toggle event listener
        toggleListener: function(elements, events, callback, toggle, passive, capture) {
            // Bail if no elements
            if (elements === null || utils.is.undefined(elements)) {
                return;
            }

            // Allow multiple events
            events = events.split(' ');

            // Whether the listener is a capturing listener or not
            // Default to false
            if (!utils.is.boolean(capture)) {
                capture = false;
            }

            // Whether the listener can be passive (i.e. default never prevented)
            // Default to true
            if (!utils.is.boolean(passive)) {
                passive = true;
            }

            // If a nodelist is passed, call itself on each node
            if (elements instanceof NodeList) {
                // Convert arguments to Array
                // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/arguments
                var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);

                // Remove the first argument (elements) as we replace it
                args.shift();

                // Create listener for each node
                [].forEach.call(elements, function(element) {
                    if (element instanceof Node) {
                        utils.toggleListener.apply(null, [element].concat(args));
                    }
                });

                return;
            }

            // Build options
            // Default to just capture boolean
            var options = capture;

            // If passive events listeners are supported
            if (support.passiveListeners) {
                options = {
                    passive: passive,
                    capture: capture
                };
            }

            // If a single node is passed, bind the event listener
            events.forEach(function(event) {
                elements[toggle ? 'addEventListener' : 'removeEventListener'](event, callback, options);
            });
        },

        // Bind event handler
        on: function(element, events, callback, passive, capture) {
            utils.toggleListener(element, events, callback, true, passive, capture);
        },

        // Unbind event handler
        off: function(element, events, callback, passive, capture) {
            utils.toggleListener(element, events, callback, false, passive, capture);
        },

        // Trigger event
        event: function(element, type, bubbles, properties) {
            // Bail if no element
            if (!element || !type) {
                return;
            }

            // Default bubbles to false
            if (!utils.is.boolean(bubbles)) {
                bubbles = false;
            }

            // Create CustomEvent constructor
            var CustomEvent;
            if (utils.is.function(window.CustomEvent)) {
                CustomEvent = window.CustomEvent;
            } else {
                // Polyfill CustomEvent
                // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
                CustomEvent = function(event, params) {
                    params = params || {
                        bubbles: false,
                        cancelable: false,
                        detail: undefined
                    };
                    var custom = document.createEvent('CustomEvent');
                    custom.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                    return custom;
                };
                CustomEvent.prototype = window.Event.prototype;
            }

            // Create and dispatch the event
            var event = new CustomEvent(type, {
                bubbles: bubbles,
                detail: properties
            });

            // Dispatch the event
            element.dispatchEvent(event);
        },

        // Toggle aria-pressed state on a toggle button
        // http://www.ssbbartgroup.com/blog/how-not-to-misuse-aria-states-properties-and-roles
        toggleState: function(target, state) {
            // Bail if no target
            if (!target) {
                return;
            }

            // Get state
            state = (utils.is.boolean(state) ? state : !target.getAttribute('aria-pressed'));

            // Set the attribute on target
            target.setAttribute('aria-pressed', state);

            return state;
        },

        // Get percentage
        getPercentage: function(current, max) {
            if (current === 0 || max === 0 || isNaN(current) || isNaN(max)) {
                return 0;
            }
            return ((current / max) * 100).toFixed(2);
        },

        // Deep extend/merge destination object with N more objects
        // http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
        // Removed call to arguments.callee (used explicit function name instead)
        extend: function() {
            // Get arguments
            var objects = arguments;

            // Bail if nothing to merge
            if (!objects.length) {
                return;
            }

            // Return first if specified but nothing to merge
            if (objects.length === 1) {
                return objects[0];
            }

            // First object is the destination
            var destination = Array.prototype.shift.call(objects);
            if (!utils.is.object(destination)) {
                destination = {};
            }

            var length = objects.length;

            // Loop through all objects to merge
            for (var i = 0; i < length; i++) {
                var source = objects[i];

                if (!utils.is.object(source)) {
                    source = {};
                }

                for (var property in source) {
                    if (source[property] && source[property].constructor && source[property].constructor === Object) {
                        destination[property] = destination[property] || {};
                        utils.extend(destination[property], source[property]);
                    } else {
                        destination[property] = source[property];
                    }
                }
            }

            return destination;
        },

        // Parse YouTube ID from url
        parseYouTubeId: function(url) {
            var regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            return url.match(regex) ? RegExp.$2 : url;
        },

        // Remove HTML from a string
        stripHTML: function(source) {
            var fragment = document.createDocumentFragment();
            var element = document.createElement('div');
            fragment.appendChild(element);
            element.innerHTML = source;
            return fragment.firstChild.innerText;
        },

        // Load an SVG sprite
        loadSprite: function(url, id) {
            if (typeof url !== 'string') {
                return;
            }

            var prefix = 'cache-';
            var hasId = typeof id === 'string';
            var isCached = false;

            function updateSprite(container, data) {
                // Inject content
                container.innerHTML = data;

                // Inject the SVG to the body
                document.body.insertBefore(container, document.body.childNodes[0]);
            }

            // Only load once
            if (!hasId || !document.querySelectorAll('#' + id).length) {
                // Create container
                var container = document.createElement('div');
                container.setAttribute('hidden', '');

                if (hasId) {
                    container.setAttribute('id', id);
                }

                // Check in cache
                if (support.storage) {
                    var cached = window.localStorage.getItem(prefix + id);
                    isCached = cached !== null;

                    if (isCached) {
                        var data = JSON.parse(cached);
                        updateSprite(container, data.content);
                    }
                }

                // ReSharper disable once InconsistentNaming
                var xhr = new XMLHttpRequest();

                // XHR for Chrome/Firefox/Opera/Safari
                if ('withCredentials' in xhr) {
                    xhr.open('GET', url, true);
                } else {
                    return;
                }

                // Once loaded, inject to container and body
                xhr.onload = function() {
                    if (support.storage) {
                        window.localStorage.setItem(prefix + id, JSON.stringify({
                            content: xhr.responseText
                        }));
                    }

                    updateSprite(container, xhr.responseText);
                };

                xhr.send();
            }
        },

        // Get the transition end event
        transitionEnd: (function() {
            var element = document.createElement('span');

            var events = {
                WebkitTransition: 'webkitTransitionEnd',
                MozTransition: 'transitionend',
                OTransition: 'oTransitionEnd otransitionend',
                transition: 'transitionend'
            }

            for (var type in events) {
                if (element.style[type] !== undefined) {
                    return events[type];
                }
            }

            return false;
        })()
    };

    // Fullscreen API
    var fullscreen = (function() {
        // Determine the prefix
        var prefix = (function() {
            var value = false;

            if (utils.is.function(document.cancelFullScreen)) {
                value = '';
            } else {
                // Check for fullscreen support by vendor prefix
                ['webkit', 'o', 'moz', 'ms', 'khtml'].some(function(prefix) {
                    if (utils.is.function(document[prefix + 'CancelFullScreen'])) {
                        value = prefix;
                        return true;
                    } else if (utils.is.function(document.msExitFullscreen) && document.msFullscreenEnabled) {
                        // Special case for MS (when isn't it?)
                        value = 'ms';
                        return true;
                    }
                });
            }

            return value;
        })();

        return {
            prefix: prefix,
            // Yet again Microsoft awesomeness,
            // Sometimes the prefix is 'ms', sometimes 'MS' to keep you on your toes
            eventType: (prefix === 'ms' ? 'MSFullscreenChange' : prefix + 'fullscreenchange'),

            // Is an element fullscreen
            isFullScreen: function(element) {
                if (!support.fullscreen) {
                    return false;
                }
                if (utils.is.undefined(element)) {
                    element = document.body;
                }
                switch (this.prefix) {
                    case '':
                        return document.fullscreenElement === element;
                    case 'moz':
                        return document.mozFullScreenElement === element;
                    default:
                        return document[prefix + 'FullscreenElement'] === element;
                }
            },
            requestFullScreen: function(element) {
                if (!support.fullscreen) {
                    return false;
                }
                if (!utils.is.htmlElement(element)) {
                    element = document.body;
                }
                return (prefix === '') ? element.requestFullScreen() : element[prefix + (prefix === 'ms' ? 'RequestFullscreen' : 'RequestFullScreen')]();
            },
            cancelFullScreen: function() {
                if (!support.fullscreen) {
                    return false;
                }
                return (prefix === '') ? document.cancelFullScreen() : document[prefix + (prefix === 'ms' ? 'ExitFullscreen' : 'CancelFullScreen')]();
            },
            element: function() {
                if (!support.fullscreen) {
                    return null;
                }
                return (prefix === '') ? document.fullscreenElement : document[prefix + 'FullscreenElement'];
            }
        };
    })();

    // Check for feature support
    var support = {
        // Basic support
        audio: 'canPlayType' in document.createElement('audio'),
        video: 'canPlayType' in document.createElement('video'),

        // Fullscreen support and set prefix
        fullscreen: fullscreen.prefix !== false,

        // Local storage
        // We can't assume if local storage is present that we can use it
        storage: (function() {
            if (!('localStorage' in window)) {
                return false;
            }

            // Try to use it (it might be disabled, e.g. user is in private/porn mode)
            // see: https://github.com/sampotts/plyr/issues/131
            var test = '___test';
            try {
                window.localStorage.setItem(test, test);
                window.localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }

            return false;
        })(),

        // Picture-in-picture support
        // Safari only currently
        pip: (function() {
            var browser = utils.getBrowser();
            return !browser.isIPhone && utils.is.function(utils.createElement('video').webkitSetPresentationMode);
        })(),

        // Airplay support
        // Safari only currently
        airplay: utils.is.function(window.WebKitPlaybackTargetAvailabilityEvent),

        // Inline playback support
        // https://webkit.org/blog/6784/new-video-policies-for-ios/
        inline: 'playsInline' in document.createElement('video'),

        // Check for mime type support against a player instance
        // Credits: http://diveintohtml5.info/everything.html
        // Related: http://www.leanbackplayer.com/test/h5mt.html
        mime: function(player, type) {
            var media = player.media;

            try {
                // Bail if no checking function
                if (!utils.is.function(media.canPlayType)) {
                    return false;
                }

                // Type specific checks
                if (player.type === 'video') {
                    switch (type) {
                        case 'video/webm':
                            return media.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/no/, '');
                        case 'video/mp4':
                            return media.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/, '');
                        case 'video/ogg':
                            return media.canPlayType('video/ogg; codecs="theora"').replace(/no/, '');
                    }
                } else if (player.type === 'audio') {
                    switch (type) {
                        case 'audio/mpeg':
                            return media.canPlayType('audio/mpeg;').replace(/no/, '');
                        case 'audio/ogg':
                            return media.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, '');
                        case 'audio/wav':
                            return media.canPlayType('audio/wav; codecs="1"').replace(/no/, '');
                    }
                }
            } catch (e) {
                return false;
            }

            // If we got this far, we're stuffed
            return false;
        },

        // Check for textTracks support
        textTracks: 'textTracks' in document.createElement('video'),

        // Check for passive event listener support
        // https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
        // https://www.youtube.com/watch?v=NPM6172J22g
        passiveListeners: (function() {
            // Test via a getter in the options object to see if the passive property is accessed
            var supported = false;
            try {
                var options = Object.defineProperty({}, 'passive', {
                    get: function() {
                        supported = true;
                    }
                });
                window.addEventListener("test", null, options);
            } catch (e) {}

            return supported;
        })(),

        // Touch
        // Remember a device can be moust + touch enabled
        touch: 'ontouchstart' in document.documentElement,

        // Detect transitions support
        transitions: utils.transitionEnd !== false,

        // Reduced motion iOS & MacOS setting
        // https://webkit.org/blog/7551/responsive-design-for-motion/
        reducedMotion: 'matchMedia' in window && window.matchMedia('(prefers-reduced-motion)').matches
    };

    // Plyr instance
    function Plyr(media, options) {
        var player = this;
        var timers = {};
        var api = {};
        player.ready = false;

        // Get the media element
        player.media = media;

        // String selector passed
        if (utils.is.string(player.media)) {
            player.media = document.querySelectorAll(player.media);
        }

        // jQuery, NodeList or Array passed, use first element
        if ((window.jQuery && player.media instanceof jQuery) ||
            utils.is.nodeList(player.media) ||
            utils.is.array(player.media)) {
            player.media = player.media[0];
        }

        // Set config
        player.config = utils.extend({}, defaults, options, (function() {
            try {
                return JSON.parse(player.media.getAttribute('data-plyr'));
            } catch (e) {}
        })());

        // Elements cache
        player.elements = {
            container: null,
            buttons: {},
            display: {},
            progress: {},
            inputs: {},
            settings: {
                menu: null,
                panes: {},
                tabs: {}
            },
            captions: null
        };

        // Captions
        player.captions = {
            enabled: false,
            captions: [],
            tracks: [],
            currentTrack: null
        };

        // Fullscreen
        player.fullscreen = {
            active: false
        };

        // Debugging
        var log = function() {};
        var warn = function() {};
        var error = function() {};
        if (player.config.debug && 'console' in window) {
            log = console.log;
            warn = console.warn;
            error = console.error;
            log('Debugging enabled');
        }

        // Log config options and support
        log('Config', player.config);
        log('Support', support);

        // Trigger events, with plyr instance passed
        function trigger(element, type, bubbles, properties) {
            utils.event(element, type, bubbles, utils.extend({}, properties, {
                plyr: player
            }));
        }

        // Trap focus inside container
        function focusTrap() {
            var tabbables = getElements('input:not([disabled]), button:not([disabled])');
            var first = tabbables[0];
            var last = tabbables[tabbables.length - 1];

            function checkFocus(event) {
                // If it is tab
                if (event.which === 9 && player.fullscreen.active) {
                    if (event.target === last && !event.shiftKey) {
                        // Move focus to first element that can be tabbed if Shift isn't used
                        event.preventDefault();
                        first.focus();
                    } else if (event.target === first && event.shiftKey) {
                        // Move focus to last element that can be tabbed if Shift is used
                        event.preventDefault();
                        last.focus();
                    }
                }
            }

            // Bind the handler
            utils.on(player.elements.container, 'keydown', checkFocus, false);
        }

        // Find all elements
        function getElements(selector) {
            return player.elements.container.querySelectorAll(selector);
        }

        // Find a single element
        function getElement(selector) {
            return getElements(selector)[0];
        }

        // Remove an element
        function removeElement(element) {
            // Remove reference from player.elements cache
            if (utils.is.string(element)) {
                utils.removeElement(player.elements[element]);
                player.elements[element] = null;
            } else {
                utils.removeElement(element);
            }
        }

        // Add elements to HTML5 media (source, tracks, etc)
        function insertElements(type, attributes) {
            if (utils.is.string(attributes)) {
                utils.insertElement(type, player.media, {
                    src: attributes
                });
            } else if (utils.is.array(attributes)) {
                attributes.forEach(function(attribute) {
                    utils.insertElement(type, player.media, attribute);
                });
            }
        }

        // Get icon URL
        function getIconUrl() {
            return {
                url: player.config.iconUrl,
                absolute: (player.config.iconUrl.indexOf("http") === 0) || player.browser.isIE
            };
        }

        // Create <svg> icon
        function createIcon(type, attributes) {
            var namespace = 'http://www.w3.org/2000/svg';
            var iconUrl = getIconUrl();
            var iconPath = (!iconUrl.absolute ? iconUrl.url : '') + '#' + player.config.iconPrefix;

            // Create <svg>
            var icon = document.createElementNS(namespace, 'svg');
            utils.setAttributes(icon, utils.extend(attributes, {
                role: 'presentation'
            }));

            // Create the <use> to reference sprite
            var use = document.createElementNS(namespace, 'use');
            use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', iconPath + '-' + type);

            // Add <use> to <svg>
            icon.appendChild(use);

            return icon;
        }

        // Create hidden text label
        function createLabel(type) {
            var text = player.config.i18n[type];

            switch (type) {
                case 'pip':
                    text = 'PIP';
                    break;

                case 'airplay':
                    text = 'AirPlay';
                    break;
            }

            return utils.createElement('span', {
                class: player.config.classes.hidden
            }, text);
        }

        // Create a badge
        function createBadge(text) {
            var badge = utils.createElement('span', {
                class: player.config.classes.menu.value
            });

            badge.appendChild(utils.createElement('span', {
                class: player.config.classes.menu.badge
            }, text));

            return badge;
        }

        // Create a <button>
        function createButton(type, attributes) {
            var button = utils.createElement('button');
            var iconDefault;
            var iconToggled;
            var labelKey;

            if (!utils.is.object(attributes)) {
                attributes = {};
            }

            if ('class' in attributes) {
                if (attributes.class.indexOf(player.config.classes.control) === -1) {
                    attributes.class += ' ' + player.config.classes.control;
                }
            } else {
                attributes.class = player.config.classes.control;
            }

            // Large play button
            switch (type) {
                case 'mute':
                    labelKey = 'toggleMute';
                    iconDefault = 'volume';
                    iconToggled = 'muted';
                    break;

                case 'captions':
                    labelKey = 'toggleCaptions';
                    iconDefault = 'captions-off';
                    iconToggled = 'captions-on';
                    break;

                case 'fullscreen':
                    labelKey = 'toggleFullscreen';
                    iconDefault = 'enter-fullscreen';
                    iconToggled = 'exit-fullscreen';
                    break;

                case 'play-large':
                    attributes.class = 'plyr__play-large';
                    type = 'play';
                    labelKey = 'play';
                    iconDefault = 'play';
                    break;

                default:
                    labelKey = type;
                    iconDefault = type;
            }

            // Merge attributes
            utils.extend(attributes, utils.getAttributesFromSelector(player.config.selectors.buttons[type], attributes));

            // Add toggle icon if needed
            if (utils.is.string(iconToggled)) {
                button.appendChild(createIcon(iconToggled, {
                    class: 'icon--' + iconToggled
                }));
            }

            button.appendChild(createIcon(iconDefault));
            button.appendChild(createLabel(labelKey));

            utils.setAttributes(button, attributes);

            player.elements.buttons[type] = button;

            return button;
        }

        // Create an <input type='range'>
        function createRange(type, attributes) {
            // Seek label
            var label = utils.createElement('label', {
                for: attributes.id,
                class: player.config.classes.hidden
            }, player.config.i18n[type]);

            // Seek input
            var input = utils.createElement('input', utils.extend(utils.getAttributesFromSelector(player.config.selectors.inputs[type]), {
                type: 'range',
                min: 0,
                max: 100,
                step: 0.1,
                value: 0,
                autocomplete: 'off'
            }, attributes));

            player.elements.inputs[type] = input;

            return {
                label: label,
                input: input
            }
        }

        // Create a <progress>
        function createProgress(type, attributes) {
            var progress = utils.createElement('progress', utils.extend(utils.getAttributesFromSelector(player.config.selectors.display[type]), {
                min: 0,
                max: 100,
                value: 0
            }, attributes));

            // Create the label inside
            if (type !== 'volume') {
                progress.appendChild(utils.createElement('span', null, '0'));

                var suffix = '';
                switch (type) {
                    case 'played':
                        suffix = player.config.i18n.played;
                        break;

                    case 'buffer':
                        suffix = player.config.i18n.buffered;
                        break;
                }

                progress.textContent = '% ' + suffix.toLowerCase();
            }

            player.elements.display[type] = progress;

            return progress;
        }

        // Create time display
        function createTime(type) {
            var container = utils.createElement('span', {
                class: 'plyr__time'
            });

            container.appendChild(utils.createElement('span', {
                class: player.config.classes.hidden
            }, player.config.i18n[type]));

            container.appendChild(utils.createElement('span', utils.getAttributesFromSelector(player.config.selectors.display[type]), '00:00'));

            player.elements.display[type] = container;

            return container;
        }

        // Build the default HTML
        // TODO: Set order based on order in the config.controls array?
        function createControls(data) {
            // Do nothing if we want no controls
            if (utils.is.empty(player.config.controls)) {
                return;
            }

            // Create the container
            var controls = utils.createElement('div', utils.getAttributesFromSelector(player.config.selectors.controls.wrapper));

            // Restart button
            if (utils.inArray(player.config.controls, 'restart')) {
                controls.appendChild(createButton('restart'));
            }

            // Rewind button
            if (utils.inArray(player.config.controls, 'rewind')) {
                controls.appendChild(createButton('rewind'));
            }

            // Play Pause button
            // TODO: This should be a toggle button really?
            if (utils.inArray(player.config.controls, 'play')) {
                controls.appendChild(createButton('play'));
                controls.appendChild(createButton('pause'));
            }

            // Fast forward button
            if (utils.inArray(player.config.controls, 'fast-forward')) {
                controls.appendChild(createButton('fast-forward'));
            }

            // Progress
            if (utils.inArray(player.config.controls, 'progress')) {
                var container = utils.createElement('span', utils.getAttributesFromSelector(player.config.selectors.progress));

                // Seek range slider
                var seek = createRange('seek', {
                    id: 'plyr-seek-' + data.id
                });
                container.appendChild(seek.label);
                container.appendChild(seek.input);

                // TODO: Add loop display indicator

                // Played progress
                container.appendChild(createProgress('played'));

                // Buffer progress
                container.appendChild(createProgress('buffer'));

                // Seek tooltip
                if (player.config.tooltips.seek) {
                    var tooltip = utils.createElement('span', {
                        role: 'tooltip',
                        class: player.config.classes.tooltip
                    }, '00:00');

                    container.appendChild(tooltip);
                    player.elements.display.seekTooltip = tooltip;
                }

                player.elements.progress = container;
                controls.appendChild(player.elements.progress);
            }

            // Media current time display
            if (utils.inArray(player.config.controls, 'current-time')) {
                controls.appendChild(createTime('currentTime'));
            }

            // Media duration display
            if (utils.inArray(player.config.controls, 'duration')) {
                controls.appendChild(createTime('duration'));
            }

            // Toggle mute button
            if (utils.inArray(player.config.controls, 'mute')) {
                controls.appendChild(createButton('mute'));
            }

            // Volume range control
            if (utils.inArray(player.config.controls, 'volume')) {
                var volume = utils.createElement('span', {
                    class: 'plyr__volume'
                });

                // Set the attributes
                var attributes = {
                    max: 10,
                    value: player.config.volume
                };

                // Create the volume range slider
                var range = createRange('volume', utils.extend(attributes, {
                    id: 'plyr-volume-' + data.id
                }));
                volume.appendChild(range.label);
                volume.appendChild(range.input);

                // Create the display progress
                var progress = createProgress('volume', attributes);
                volume.appendChild(progress);

                controls.appendChild(volume);
            }

            // Toggle captions button
            if (utils.inArray(player.config.controls, 'captions')) {
                controls.appendChild(createButton('captions'));
            }

            // Settings button / menu
            if (utils.inArray(player.config.controls, 'settings') && !utils.is.empty(player.config.settings)) {
                var menu = utils.createElement('div', {
                    class: 'plyr__menu'
                });

                menu.appendChild(createButton('settings', {
                    id: 'plyr-settings-toggle-' + data.id,
                    'aria-haspopup': true,
                    'aria-controls': 'plyr-settings-' + data.id,
                    'aria-expanded': false
                }));

                var form = utils.createElement('form', {
                    class: 'plyr__menu__container',
                    id: 'plyr-settings-' + data.id,
                    'aria-hidden': true,
                    'aria-labelled-by': 'plyr-settings-toggle-' + data.id,
                    role: 'tablist',
                    tabindex: -1
                });

                var inner = utils.createElement('div');

                var home = utils.createElement('div', {
                    id: 'plyr-settings-' + data.id + '-home',
                    'aria-hidden': false,
                    'aria-labelled-by': 'plyr-settings-toggle-' + data.id,
                    role: 'tabpanel'
                });

                // Create the tab list
                var tabs = utils.createElement('ul', {
                    role: 'tablist'
                });

                // Build the tabs
                player.config.settings.forEach(function(type) {
                    var tab = utils.createElement('li', {
                        role: 'tab',
                        hidden: ''
                    });

                    var button = utils.createElement('button', utils.extend(utils.getAttributesFromSelector(player.config.selectors.buttons.settings), {
                        type: 'button',
                        class: player.config.classes.control + ' ' + player.config.classes.control + '--forward',
                        id: 'plyr-settings-' + data.id + '-' + type + '-tab',
                        'aria-haspopup': true,
                        'aria-controls': 'plyr-settings-' + data.id + '-' + type,
                        'aria-expanded': false
                    }), player.config.i18n[type]);

                    var value = utils.createElement('span', {
                        class: player.config.classes.menu.value
                    });

                    // Speed contains HTML entities
                    value.innerHTML = data[type];

                    button.appendChild(value);
                    tab.appendChild(button);
                    tabs.appendChild(tab);

                    player.elements.settings.tabs[type] = tab;
                });

                home.appendChild(tabs);
                inner.appendChild(home);

                // Build the panes
                player.config.settings.forEach(function(type) {
                    var pane = utils.createElement('div', {
                        id: 'plyr-settings-' + data.id + '-' + type,
                        'aria-hidden': true,
                        'aria-labelled-by': 'plyr-settings-' + data.id + '-' + type + '-tab',
                        role: 'tabpanel',
                        tabindex: -1,
                        hidden: ''
                    });

                    var back = utils.createElement('button', {
                        type: 'button',
                        class: player.config.classes.control + ' ' + player.config.classes.control + '--back',
                        'aria-haspopup': true,
                        'aria-controls': 'plyr-settings-' + data.id + '-home',
                        'aria-expanded': false
                    }, player.config.i18n[type]);

                    pane.appendChild(back);

                    var options = utils.createElement('ul');

                    pane.appendChild(options);
                    inner.appendChild(pane);

                    player.elements.settings.panes[type] = pane;
                });

                form.appendChild(inner);
                menu.appendChild(form);
                controls.appendChild(menu);

                player.elements.settings.form = form;
                player.elements.settings.menu = menu;
            }

            // Picture in picture button
            if (utils.inArray(player.config.controls, 'pip') && support.pip) {
                controls.appendChild(createButton('pip'));
            }

            // Airplay button
            if (utils.inArray(player.config.controls, 'airplay') && support.airplay) {
                controls.appendChild(createButton('airplay'));
            }

            // Toggle fullscreen button
            if (utils.inArray(player.config.controls, 'fullscreen')) {
                controls.appendChild(createButton('fullscreen'));
            }

            // Larger overlaid play button
            if (utils.inArray(player.config.controls, 'play-large')) {
                player.elements.buttons.playLarge = createButton('play-large');
                player.elements.container.appendChild(player.elements.buttons.playLarge);
            }

            player.elements.controls = controls;

            setLoopMenu();
            setSpeedMenu();

            return controls;
        }

        // Set the YouTube quality menu
        // TODO: Support for HTML5
        // YouTube: "hd2160", "hd1440", "hd1080", "hd720", "large", "medium", "small", "tiny", "auto"
        function setQualityMenu() {
            var list = player.elements.settings.panes.quality.querySelector('ul');

            if (utils.is.empty(player.config.quality.options)) {
                player.elements.settings.tabs.quality.setAttribute('hidden', '');
                player.elements.settings.panes.quality.setAttribute('hidden', '');
                return;
            }

            // Show the pane and tab
            player.elements.settings.tabs.quality.removeAttribute('hidden');
            player.elements.settings.panes.quality.removeAttribute('hidden');

            // Empty the menu
            utils.emptyElement(list);

            // Get the badge HTML for HD, 4K etc
            function getBadge(quality) {
                var label = "";

                switch (quality) {
                    case 'hd2160':
                        label = '4K';
                        break;
                    case 'hd1440':
                        label = 'WQHD';
                        break;
                    case 'hd1080':
                        label = 'HD';
                        break;
                    case 'hd720':
                        label = 'HD';
                        break;
                }

                if (!label.length) {
                    return null;
                }

                return createBadge(label);
            }

            // Translate the quality key into a nice label
            function getLabel(quality) {
                switch (quality) {
                    case 'hd2160':
                        return '2160P';
                    case 'hd1440':
                        return '1440P';
                    case 'hd1080':
                        return '1080P';
                    case 'hd720':
                        return '720P';
                    case 'large':
                        return '480P';
                    case 'medium':
                        return '360P';
                    case 'small':
                        return '240P';
                    default:
                        return 'Auto';
                }
            }

            if (utils.is.array(options) && !utils.is.empty(options)) {
                options.filter(function(quality) {
                    // Remove any unwanted quality levels
                    return !utils.inArray(['tiny', 'small'], quality);
                }).forEach(function(quality) {
                    var item = utils.createElement('li');

                    var label = utils.createElement('label', {
                        class: player.config.classes.control
                    });

                    var radio = utils.createElement('input', utils.extend(utils.getAttributesFromSelector(player.config.selectors.inputs.quality), {
                        type: 'radio',
                        name: 'plyr-quality',
                        value: quality,
                    }));

                    if (quality === player.config.quality.selected) {
                        radio.checked = true;
                    }

                    label.appendChild(radio);
                    label.appendChild(document.createTextNode(getLabel(quality)));

                    var badge = getBadge(quality);
                    if (utils.is.htmlElement(badge)) {
                        label.appendChild(badge);
                    }

                    item.appendChild(label);
                    list.appendChild(item);
                });
            }
        }

        // Set the looping options
        function setLoopMenu() {
            var options = ['start', 'end', 'all', 'reset'];
            var list = player.elements.settings.panes.loop.querySelector('ul');

            // Show the pane and tab
            player.elements.settings.tabs.loop.removeAttribute('hidden');
            player.elements.settings.panes.loop.removeAttribute('hidden');

            // Empty the menu
            utils.emptyElement(list);

            options.forEach(function(option) {
                var item = utils.createElement('li');

                var button = utils.createElement('button', utils.extend(utils.getAttributesFromSelector(player.config.selectors.buttons.loop), {
                    type: 'button',
                    class: player.config.classes.control,
                    'data-plyr-loop-action': option
                }), player.config.i18n[option]);

                if (utils.inArray(['start', 'end'], option)) {
                    var badge = createBadge('00:00');
                    button.appendChild(badge);
                }

                item.appendChild(button);
                list.appendChild(item);
            });
        }

        // Set a list of available captions languages
        function setCaptionsMenu() {
            var list = player.elements.settings.panes.captions.querySelector('ul');

            // Show the pane and tab
            player.elements.settings.tabs.captions.removeAttribute('hidden');
            player.elements.settings.panes.captions.removeAttribute('hidden');

            // Empty the menu
            utils.emptyElement(list);

            // If there's no captions, bail
            if (utils.is.empty(player.captions.tracks)) {
                return;
            }

            // Re-map the tracks into just the data we need
            var tracks = [].map.call(player.captions.tracks, function(track) {
                return {
                    language: track.language,
                    badge: true,
                    label: !utils.is.empty(track.label) ? track.label : track.language.toUpperCase()
                }
            });

            // Add the "None" option to turn off captions
            tracks.unshift({
                language: 'off',
                label: player.config.i18n.none
            });

            // Generate options
            tracks.forEach(function(track) {
                var item = utils.createElement('li');

                var label = utils.createElement('label', {
                    class: player.config.classes.control
                });

                var radio = utils.createElement('input', utils.extend(utils.getAttributesFromSelector(player.config.selectors.inputs.language), {
                    type: 'radio',
                    name: 'plyr-language',
                    value: track.language,
                }));

                if (track.language.toLowerCase() === player.config.captions.language.toLowerCase()) {
                    radio.checked = true;
                }

                label.appendChild(radio);
                label.appendChild(document.createTextNode(track.label || track.language));

                if (track.badge) {
                    label.appendChild(createBadge(track.language.toUpperCase()));
                }

                item.appendChild(label);
                list.appendChild(item);
            });
        }

        // Set a list of available captions languages
        function setSpeedMenu() {
            var list = player.elements.settings.panes.speed.querySelector('ul');

            // Show the pane and tab
            player.elements.settings.tabs.speed.removeAttribute('hidden');
            player.elements.settings.panes.speed.removeAttribute('hidden');

            // Empty the menu
            utils.emptyElement(list);

            // Create items
            player.config.speed.options.forEach(function(speed) {
                var item = utils.createElement('li');

                var label = utils.createElement('label', {
                    class: player.config.classes.control
                });

                var radio = utils.createElement('input', utils.extend(utils.getAttributesFromSelector(player.config.selectors.inputs.speed), {
                    type: 'radio',
                    name: 'plyr-speed',
                    value: speed,
                }));

                label.appendChild(radio);
                label.insertAdjacentHTML('beforeend', getSpeedLabel(speed));
                item.appendChild(label);
                list.appendChild(item);
            });

            setSelectedSpeed(list);
        }

        // Update the UI
        function setSelectedSpeed(list) {
            var speed = player.config.speed.selected;

            // Unsupported speed
            if (!utils.inArray(player.config.speed.options, speed)) {
                return;
            }

            // Get the list if we need to
            if (!utils.is.htmlElement(list)) {
                list = player.elements.settings.panes.speed.querySelector('ul');
            }

            // Find the radio option
            var target = list.querySelector('[value="' + speed + '"]');

            if (!utils.is.htmlElement(target)) {
                return;
            }

            // Check it
            target.checked = true;

            // Find the label
            var label = player.elements.settings.tabs.speed.querySelector('.' + player.config.classes.menu.value);
            label.innerHTML = getSpeedLabel(speed);
        }

        // Setup fullscreen
        function setupFullscreen() {
            if (!player.supported.full) {
                return;
            }

            if ((player.type !== 'audio' || player.config.fullscreen.allowAudio) && player.config.fullscreen.enabled) {
                // Check for native support
                var nativeSupport = support.fullscreen;

                if (nativeSupport || (player.config.fullscreen.fallback && !utils.inFrame())) {
                    log((nativeSupport ? 'Native' : 'Fallback') + ' fullscreen enabled');

                    // Add styling hook
                    utils.toggleClass(player.elements.container, player.config.classes.fullscreen.enabled, true);
                } else {
                    log('Fullscreen not supported and fallback disabled');
                }

                // Toggle state
                if (player.elements.buttons && player.elements.buttons.fullscreen) {
                    utils.toggleState(player.elements.buttons.fullscreen, false);
                }

                // Setup focus trap
                focusTrap();
            }
        }

        // Setup captions
        function setupCaptions(tracks) {
            // Only Vimeo and HTML5 video supported at this point
            if (!utils.inArray(['video', 'vimeo'], player.type) || (player.type === 'video' && !support.textTracks)) {
                return;
            }

            // Inject the container
            if (!utils.is.htmlElement(player.elements.captions)) {
                player.elements.captions = utils.createElement('div', utils.getAttributesFromSelector(player.config.selectors.captions));
                utils.insertAfter(player.elements.captions, player.elements.wrapper);
            }

            // Get tracks
            player.captions.tracks = utils.is.array(tracks) ? tracks : player.media.textTracks;

            // Set the class hook
            utils.toggleClass(player.elements.container, player.config.classes.captions.enabled, !utils.is.empty(player.captions.tracks));

            // If no caption file exists, hide container for caption text
            if (utils.is.empty(player.captions.tracks)) {
                return;
            }

            // Enable UI
            showCaptions();

            if (player.type === 'video') {
                var language = player.config.captions.language.toLowerCase();

                // Turn off native caption rendering to avoid double captions
                [].forEach.call(player.captions.tracks, function(track) {
                    // Remove previous bindings (if we've changed source or language)
                    utils.off(track, 'cuechange', setActiveCue);

                    // Hide captions
                    track.mode = 'hidden';

                    // If language matches, it's the selected track
                    if (track.language === language) {
                        player.captions.currentTrack = track;
                    }
                });

                // If we couldn't get the requested language, we get the first
                if (!utils.is.track(player.captions.currentTrack)) {
                    warn('No language found to match ' + language + ' in tracks');
                    player.captions.currentTrack = player.captions.tracks[0];
                }

                // If it's a caption or subtitle, render it
                var track = player.captions.currentTrack;
                if (utils.is.track(track) && utils.inArray(['captions', 'subtitles'], track.kind)) {
                    utils.on(track, 'cuechange', setActiveCue);

                    // If we change the active track while a cue is already displayed we need to update it
                    if (track.activeCues && track.activeCues.length > 0) {
                        setActiveCue(track);
                    }
                }
            }

            // Set available languages in list
            setCaptionsMenu();
        }

        // Get current selected caption language
        function getLanguage() {
            if (!support.textTracks || utils.is.empty(player.captions.tracks)) {
                return 'No Subs';
            }

            if (player.captions.enabled) {
                return player.captions.currentTrack.label;
            } else {
                return 'Disabled';
            }
        }

        // Display active caption if it contains text
        function setActiveCue(track) {
            // Get the track from the event if needed
            if (utils.is.event(track)) {
                track = track.target;
            }

            var active = track.activeCues[0];

            // Display a cue, if there is one
            if (utils.is.cue(active)) {
                setCaption(active.getCueAsHTML());
            } else {
                setCaption();
            }
        }

        // Set the current caption
        function setCaption(caption) {
            if (utils.is.htmlElement(player.elements.captions)) {
                var content = utils.createElement('span');

                // Empty the container
                utils.emptyElement(player.elements.captions);

                // Default to empty
                if (utils.is.undefined(caption)) {
                    caption = '';
                }

                // Set the span content
                if (utils.is.string(caption)) {
                    content.textContent = caption.trim();
                } else {
                    content.appendChild(caption);
                }

                // Set new caption text
                player.elements.captions.appendChild(content);

                // Force redraw (for Safari)
                // var redraw = captions.offsetHeight;
            } else {
                warn('No captions element to render to');
            }
        }

        // Display captions container and button (for initialization)
        function showCaptions() {
            // If there's no caption toggle, bail
            if (!player.elements.buttons.captions) {
                return;
            }

            // Try to load the value from storage
            var active = player.storage.captions;

            // Otherwise fall back to the default config
            if (!utils.is.boolean(active)) {
                active = player.config.captions.active;
            } else {
                player.config.captions.active = active;
            }

            if (active) {
                utils.toggleClass(player.elements.container, player.config.classes.captions.active, true);
                utils.toggleState(player.elements.buttons.captions, true);
            }
        }

        // Insert controls
        function injectControls() {
            // Sprite
            if (player.config.loadSprite) {
                var iconUrl = getIconUrl();

                // Only load external sprite using AJAX
                if (iconUrl.absolute) {
                    log('AJAX loading absolute SVG sprite' + (player.browser.isIE ? ' (due to IE)' : ''));
                    utils.loadSprite(iconUrl.url, "sprite-plyr");
                } else {
                    log('Sprite will be used as external resource directly');
                }
            }

            // Create a unique ID
            player.id = Math.floor(Math.random() * 10000);

            // Null by default
            var controls = null;

            // HTML passed as the option
            if (utils.is.string(player.config.controls)) {
                controls = player.config.controls;
            }
            // A custom function to build controls
            // The function can return a HTMLElement or String
            else if (utils.is.function(player.config.controls)) {
                controls = player.config.controls({
                    id: player.id,
                    seektime: player.config.seekTime
                });
            }
            // Create controls
            else {
                controls = createControls({
                    id: player.id,
                    seektime: player.config.seekTime,
                    speed: getSpeedLabel(),
                    // TODO: Get current quality
                    quality: 'HD',
                    captions: getLanguage(),
                    // TODO: Get loop
                    loop: 'None'
                });
            }

            // Controls container
            var target;

            // Inject to custom location
            if (utils.is.string(player.config.selectors.controls.container)) {
                target = document.querySelector(player.config.selectors.controls.container);
            }

            // Inject into the container by default
            if (!utils.is.htmlElement(target)) {
                target = player.elements.container
            }

            // Inject controls HTML
            if (utils.is.htmlElement(controls)) {
                target.appendChild(controls);
            } else {
                target.insertAdjacentHTML('beforeend', controls);
            }

            // Find the elements if need be
            if (utils.is.htmlElement(player.elements.controls)) {
                findElements();
            }

            // Setup tooltips
            if (player.config.tooltips.controls) {
                var labels = getElements([player.config.selectors.controls.wrapper, ' ', player.config.selectors.labels, ' .', player.config.classes.hidden].join(''));

                for (var i = labels.length - 1; i >= 0; i--) {
                    var label = labels[i];

                    utils.toggleClass(label, player.config.classes.hidden, false);
                    utils.toggleClass(label, player.config.classes.tooltip, true);
                }
            }
        }

        // Find the UI controls and store references in custom controls
        // TODO: Allow settings menus with custom controls
        function findElements() {
            try {
                player.elements.controls = getElement(player.config.selectors.controls.wrapper);

                // Buttons
                player.elements.buttons = {
                    play: getElements(player.config.selectors.buttons.play),
                    pause: getElement(player.config.selectors.buttons.pause),
                    restart: getElement(player.config.selectors.buttons.restart),
                    rewind: getElement(player.config.selectors.buttons.rewind),
                    forward: getElement(player.config.selectors.buttons.forward),
                    mute: getElement(player.config.selectors.buttons.mute),
                    pip: getElement(player.config.selectors.buttons.pip),
                    airplay: getElement(player.config.selectors.buttons.airplay),
                    settings: getElement(player.config.selectors.buttons.settings),
                    captions: getElement(player.config.selectors.buttons.captions),
                    fullscreen: getElement(player.config.selectors.buttons.fullscreen)
                };

                // Progress
                player.elements.progress = getElement(player.config.selectors.progress);

                // Inputs
                player.elements.inputs = {
                    seek: getElement(player.config.selectors.inputs.seek),
                    volume: getElement(player.config.selectors.inputs.volume),
                };

                // Display
                player.elements.display = {
                    buffer: getElement(player.config.selectors.display.buffer),
                    played: getElement(player.config.selectors.display.played),
                    volume: getElement(player.config.selectors.display.volume),
                    duration: getElement(player.config.selectors.display.duration),
                    currentTime: getElement(player.config.selectors.display.currentTime),
                };

                // Seek tooltip
                if (utils.is.htmlElement(player.elements.progress)) {
                    player.elements.display.seekTooltip = player.elements.progress.querySelector('.' + player.config.classes.tooltip);
                }

                return true;
            } catch (error) {
                // Log it
                warn('It looks like there is a problem with your custom controls HTML', error);

                // Restore native video controls
                toggleNativeControls(true);

                return false;
            }
        }

        // Toggle style hook
        function toggleStyleHook() {
            utils.toggleClass(player.elements.container, player.config.selectors.container.replace('.', ''), player.supported.full);
        }

        // Toggle native HTML5 media controls
        function toggleNativeControls(toggle) {
            if (toggle && utils.inArray(types.html5, player.type)) {
                player.media.setAttribute('controls', '');
            } else {
                player.media.removeAttribute('controls');
            }
        }

        // Setup aria attribute for play and iframe title
        function setTitle(iframe) {
            // Find the current text
            var label = player.config.i18n.play;

            // If there's a media title set, use that for the label
            if (utils.is.string(player.config.title) && !utils.is.empty(player.config.title)) {
                label += ', ' + player.config.title;

                // Set container label
                player.elements.container.setAttribute('aria-label', player.config.title);
            }

            // If there's a play button, set label
            if (player.supported.full) {
                if (utils.is.htmlElement(player.elements.buttons.play)) {
                    player.elements.buttons.play.setAttribute('aria-label', label);
                }
                if (utils.is.htmlElement(player.elements.buttons.playLarge)) {
                    player.elements.buttons.playLarge.setAttribute('aria-label', label);
                }
            }

            // Set iframe title
            // https://github.com/sampotts/plyr/issues/124
            if (utils.is.htmlElement(iframe)) {
                var title = utils.is.string(player.config.title) && !utils.is.empty(player.config.title) ? player.config.title : 'video';
                iframe.setAttribute('title', player.config.i18n.frameTitle.replace('{title}', title));
            }
        }

        // Setup localStorage
        function setupStorage() {
            var value = null;
            player.storage = {};

            // Bail if we don't have localStorage support or it's disabled
            if (!support.storage || !player.config.storage.enabled) {
                return;
            }

            // Clean up old volume
            // https://github.com/sampotts/plyr/issues/171
            window.localStorage.removeItem('plyr-volume');

            // load value from the current key
            value = window.localStorage.getItem(player.config.storage.key);

            if (!value) {
                // Key wasn't set (or had been cleared), move along
                return;
            } else if (/^\d+(\.\d+)?$/.test(value)) {
                // If value is a number, it's probably volume from an older
                // version of player. See: https://github.com/sampotts/plyr/pull/313
                // Update the key to be JSON
                updateStorage({
                    volume: parseFloat(value)
                });
            } else {
                // Assume it's JSON from this or a later version of plyr
                player.storage = JSON.parse(value);
            }
        }

        // Save a value back to local storage
        function updateStorage(value) {
            // Bail if we don't have localStorage support or it's disabled
            if (!support.storage || !player.config.storage.enabled) {
                return;
            }

            // Update the working copy of the values
            utils.extend(player.storage, value);

            // Update storage
            window.localStorage.setItem(player.config.storage.key, JSON.stringify(player.storage));
        }

        // Setup media
        function setupMedia() {
            // If there's no media, bail
            if (!player.media) {
                warn('No media element found!');
                return;
            }

            if (player.supported.full) {
                // Add type class
                utils.toggleClass(player.elements.container, player.config.classes.type.replace('{0}', player.type), true);

                // Add video class for embeds
                // This will require changes if audio embeds are added
                if (utils.inArray(types.embed, player.type)) {
                    utils.toggleClass(player.elements.container, player.config.classes.type.replace('{0}', 'video'), true);
                }

                // Check for picture-in-picture support
                utils.toggleClass(player.elements.container, player.config.classes.pip.enabled, support.pip && player.type === 'video');

                // Check for airplay support
                utils.toggleClass(player.elements.container, player.config.classes.airplay.enabled, support.airplay && utils.inArray(types.html5, player.type));

                // If there's no autoplay attribute, assume the video is stopped and add state class
                utils.toggleClass(player.elements.container, player.config.classes.stopped, player.config.autoplay);

                // Add iOS class
                utils.toggleClass(player.elements.container, player.config.classes.isIos, player.browser.isIos);

                // Add touch class
                utils.toggleClass(player.elements.container, player.config.classes.isTouch, support.touch);
            }

            // Inject the player wrapper
            if (utils.inArray(['video', 'youtube', 'vimeo'], player.type)) {
                // Create the wrapper div
                player.elements.wrapper = utils.createElement('div', {
                    class: player.config.classes.video
                });

                // Wrap the video in a container
                utils.wrap(player.media, player.elements.wrapper);
            }

            // Embeds
            if (utils.inArray(types.embed, player.type)) {
                setupEmbed();
            }
        }

        // Setup YouTube/Vimeo
        function setupEmbed() {
            //var container = utils.createElement('div');
            var mediaId;
            var id = player.type + '-' + Math.floor(Math.random() * (10000));

            // Parse IDs from URLs if supplied
            switch (player.type) {
                case 'youtube':
                    mediaId = utils.parseYouTubeId(player.embedId);
                    break;

                default:
                    mediaId = player.embedId;
            }

            // Remove old containers
            var containers = getElements('[id^="' + player.type + '-"]');
            for (var i = containers.length - 1; i >= 0; i--) {
                utils.removeElement(containers[i]);
            }

            // Add embed class for responsive
            utils.toggleClass(player.elements.wrapper, player.config.classes.embed, true);

            if (player.type === 'youtube') {
                // Set ID
                player.media.setAttribute('id', id);

                // Setup API
                if (utils.is.object(window.YT)) {
                    youTubeReady(mediaId);
                } else {
                    // Load the API
                    utils.injectScript(player.config.urls.youtube.api);

                    // Setup callback for the API
                    window.onYouTubeReadyCallbacks = window.onYouTubeReadyCallbacks || [];

                    // Add to queue
                    window.onYouTubeReadyCallbacks.push(function() {
                        youTubeReady(mediaId);
                    });

                    // Set callback to process queue
                    window.onYouTubeIframeAPIReady = function() {
                        window.onYouTubeReadyCallbacks.forEach(function(callback) {
                            callback();
                        });
                    };
                }
            } else if (player.type === 'vimeo') {
                // Set ID
                player.media.setAttribute('id', id);

                // Load the API if not already
                if (!utils.is.object(window.Vimeo)) {
                    utils.injectScript(player.config.urls.vimeo.api);

                    // Wait for fragaloop load
                    var vimeoTimer = window.setInterval(function() {
                        if (utils.is.object(window.Vimeo)) {
                            window.clearInterval(vimeoTimer);
                            vimeoReady(mediaId);
                        }
                    }, 50);
                } else {
                    vimeoReady(mediaId);
                }
            } else if (player.type === 'soundcloud') {
                // TODO: Currently unsupported and undocumented
                // Inject the iframe
                var soundCloud = utils.createElement('iframe');

                // Watch for iframe load
                soundCloud.loaded = false;
                utils.on(soundCloud, 'load', function() {
                    soundCloud.loaded = true;
                });

                utils.setAttributes(soundCloud, {
                    'src': 'https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/' + mediaId,
                    'id': id
                });

                player.media.appendChild(soundCloud);

                // Load the API if not already
                if (!window.SC) {
                    utils.injectScript(player.config.urls.soundcloud.api);
                }

                // Wait for SC load
                var soundCloudTimer = window.setInterval(function() {
                    if (window.SC && soundCloud.loaded) {
                        window.clearInterval(soundCloudTimer);
                        soundcloudReady.call(soundCloud);
                    }
                }, 50);
            }
        }

        // When embeds are ready
        function embedReady() {
            // Setup the UI and call ready if full support
            if (player.supported.full) {
                setupInterface();
                ready();
            }

            // Set title
            setTitle(getElement('iframe'));
        }

        // Handle YouTube API ready
        function youTubeReady(videoId) {
            // Setup instance
            // https://developers.google.com/youtube/iframe_api_reference
            player.embed = new window.YT.Player(player.media.id, {
                videoId: videoId,
                playerVars: {
                    autoplay: (player.config.autoplay ? 1 : 0),
                    controls: (player.supported.full ? 0 : 1),
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    cc_load_policy: (player.config.captions.active ? 1 : 0),
                    cc_lang_pref: 'en',
                    wmode: 'transparent',
                    modestbranding: 1,
                    disablekb: 1,
                    playsinline: 1,
                    origin: window.location.href
                },
                events: {
                    'onError': function(event) {
                        trigger(player.elements.container, 'error', true, {
                            code: event.data,
                            embed: event.target
                        });
                    },
                    'onPlaybackQualityChange': function(event) {
                        // Get the instance
                        var instance = event.target;

                        // Get current quality
                        var quality = instance.getPlaybackQuality();

                        // var set = player.setPlaybackQuality();
                        console.warn('quality change', quality);
                    },
                    'onPlaybackRateChange': function(event) {
                        // Get the instance
                        var instance = event.target;

                        // Get current speed
                        player.media.playbackRate = instance.getPlaybackRate();

                        // Trigger timeupdate
                        trigger(player.media, 'ratechange');
                    },
                    'onReady': function(event) {
                        // Get the instance
                        var instance = event.target;

                        // Create a faux HTML5 API using the YouTube API
                        player.media.play = function() {
                            instance.playVideo();
                            player.media.paused = false;
                        };
                        player.media.pause = function() {
                            instance.pauseVideo();
                            player.media.paused = true;
                        };
                        player.media.stop = function() {
                            instance.stopVideo();
                            player.media.paused = true;
                        };
                        player.media.duration = instance.getDuration();
                        player.media.paused = true;
                        player.media.currentTime = 0;
                        player.media.muted = instance.isMuted();

                        // Get available speeds
                        player.config.speed.selected = instance.getPlaybackRate();
                        player.config.speed.options = instance.getAvailablePlaybackRates();
                        setSpeedMenu();

                        // Set title
                        player.config.title = instance.getVideoData().title;

                        // Set the tabindex
                        if (player.supported.full) {
                            player.media.setAttribute('tabindex', -1);
                        }

                        // Update UI
                        embedReady();

                        // Trigger timeupdate
                        trigger(player.media, 'timeupdate');

                        // Trigger timeupdate
                        trigger(player.media, 'durationchange');

                        // Reset timer
                        window.clearInterval(timers.buffering);

                        // Setup buffering
                        timers.buffering = window.setInterval(function() {
                            // Get loaded % from YouTube
                            player.media.buffered = instance.getVideoLoadedFraction();

                            // Trigger progress only when we actually buffer something
                            if (player.media.lastBuffered === null || player.media.lastBuffered < player.media.buffered) {
                                trigger(player.media, 'progress');
                            }

                            // Set last buffer point
                            player.media.lastBuffered = player.media.buffered;

                            // Bail if we're at 100%
                            if (player.media.buffered === 1) {
                                window.clearInterval(timers.buffering);

                                // Trigger event
                                trigger(player.media, 'canplaythrough');
                            }
                        }, 200);
                    },
                    'onStateChange': function(event) {
                        // Get the instance
                        var instance = event.target;

                        // Reset timer
                        window.clearInterval(timers.playing);

                        // Handle events
                        // -1   Unstarted
                        // 0    Ended
                        // 1    Playing
                        // 2    Paused
                        // 3    Buffering
                        // 5    Video cued
                        switch (event.data) {
                            case 0:
                                // YouTube doesn't support loop for a single video, so mimick it.
                                if (player.config.loop.active) {
                                    // YouTube needs a call to `stopVideo` before playing again
                                    instance.stopVideo();
                                    instance.playVideo();

                                    break;
                                }

                                player.media.paused = true;

                                trigger(player.media, 'ended');

                                break;

                            case 1:
                                player.media.paused = false;

                                // If we were seeking, fire seeked event
                                if (player.media.seeking) {
                                    trigger(player.media, 'seeked');
                                }

                                player.media.seeking = false;

                                trigger(player.media, 'play');
                                trigger(player.media, 'playing');

                                // Poll to get playback progress
                                timers.playing = window.setInterval(function() {
                                    // Set the current time
                                    player.media.currentTime = instance.getCurrentTime();

                                    // Trigger timeupdate
                                    trigger(player.media, 'timeupdate');
                                }, 100);

                                // Check duration again due to YouTube bug
                                // https://github.com/sampotts/plyr/issues/374
                                // https://code.google.com/p/gdata-issues/issues/detail?id=8690
                                if (player.media.duration !== instance.getDuration()) {
                                    player.media.duration = instance.getDuration();
                                    trigger(player.media, 'durationchange');
                                }

                                // Get quality
                                var qualityOptions = instance.getAvailableQualityLevels();
                                var quality = instance.getPlaybackQuality();
                                setQualityMenu(qualityOptions, quality);

                                break;

                            case 2:
                                player.media.paused = true;

                                trigger(player.media, 'pause');

                                break;
                        }

                        trigger(player.elements.container, 'statechange', false, {
                            code: event.data
                        });
                    }
                }
            });
        }

        // Vimeo ready
        function vimeoReady(mediaId) {
            // Setup instance
            // https://github.com/vimeo/player.js
            player.embed = new window.Vimeo.Player(player.media, {
                id: mediaId,
                loop: player.config.loop.active,
                autoplay: player.config.autoplay,
                byline: false,
                portrait: false,
                title: false
            });

            // Create a faux HTML5 API using the Vimeo API
            player.media.play = function() {
                player.embed.play();
                player.media.paused = false;
            };
            player.media.pause = function() {
                player.embed.pause();
                player.media.paused = true;
            };
            player.media.stop = function() {
                player.embed.stop();
                player.media.paused = true;
            };

            player.media.paused = true;
            player.media.currentTime = 0;

            // Update UI
            embedReady();

            player.embed.getCurrentTime().then(function(value) {
                player.media.currentTime = value;

                // Trigger timeupdate
                trigger(player.media, 'timeupdate');
            });

            player.embed.getDuration().then(function(value) {
                player.media.duration = value;

                // Trigger timeupdate
                trigger(player.media, 'durationchange');
            });

            // Get captions
            player.embed.getTextTracks().then(function(tracks) {
                // tracks = an array of track objects
                setupCaptions(tracks);

                // TODO: Captions
                if (player.config.captions.active) {
                    player.embed.enableTextTrack(player.config.captions.language.toLowerCase());
                }
            });

            player.embed.on('cuechange', function(data) {
                var cue = null;

                if (data.cues.length) {
                    cue = utils.stripHTML(data.cues[0].text);
                }

                setCaption(cue);
            });

            player.embed.on('loaded', function() {
                // Fix keyboard focus issues
                // https://github.com/sampotts/plyr/issues/317
                if (utils.is.htmlElement(player.embed.element) && player.supported.full) {
                    player.embed.element.setAttribute('tabindex', -1);
                }
            });

            player.embed.on('play', function() {
                player.media.paused = false;
                trigger(player.media, 'play');
                trigger(player.media, 'playing');
            });

            player.embed.on('pause', function() {
                player.media.paused = true;
                trigger(player.media, 'pause');
            });

            player.embed.on('timeupdate', function(data) {
                player.media.seeking = false;
                player.media.currentTime = data.seconds;
                trigger(player.media, 'timeupdate');
            });

            player.embed.on('progress', function(data) {
                player.media.buffered = data.percent;
                trigger(player.media, 'progress');

                if (parseInt(data.percent) === 1) {
                    // Trigger event
                    trigger(player.media, 'canplaythrough');
                }
            });

            player.embed.on('seeked', function() {
                player.media.seeking = false;
                trigger(player.media, 'seeked');
                trigger(player.media, 'play');
            });

            player.embed.on('ended', function() {
                player.media.paused = true;
                trigger(player.media, 'ended');
            });
        }

        // Soundcloud ready
        function soundcloudReady() {
            /* jshint validthis: true */
            player.embed = window.SC.Widget(this);

            // Setup on ready
            player.embed.bind(window.SC.Widget.Events.READY, function() {
                // Create a faux HTML5 API using the Soundcloud API
                player.media.play = function() {
                    player.embed.play();
                    player.media.paused = false;
                };
                player.media.pause = function() {
                    player.embed.pause();
                    player.media.paused = true;
                };
                player.media.stop = function() {
                    player.embed.seekTo(0);
                    player.embed.pause();
                    player.media.paused = true;
                };

                player.media.paused = true;
                player.media.currentTime = 0;

                player.embed.getDuration(function(value) {
                    player.media.duration = value / 1000;

                    // Update UI
                    embedReady();
                });

                player.embed.getPosition(function(value) {
                    player.media.currentTime = value;

                    // Trigger timeupdate
                    trigger(player.media, 'timeupdate');
                });

                player.embed.bind(window.SC.Widget.Events.PLAY, function() {
                    player.media.paused = false;
                    trigger(player.media, 'play');
                    trigger(player.media, 'playing');
                });

                player.embed.bind(window.SC.Widget.Events.PAUSE, function() {
                    player.media.paused = true;
                    trigger(player.media, 'pause');
                });

                player.embed.bind(window.SC.Widget.Events.PLAY_PROGRESS, function(data) {
                    player.media.seeking = false;
                    player.media.currentTime = data.currentPosition / 1000;
                    trigger(player.media, 'timeupdate');
                });

                player.embed.bind(window.SC.Widget.Events.LOAD_PROGRESS, function(data) {
                    player.media.buffered = data.loadProgress;
                    trigger(player.media, 'progress');

                    if (parseInt(data.loadProgress) === 1) {
                        // Trigger event
                        trigger(player.media, 'canplaythrough');
                    }
                });

                player.embed.bind(window.SC.Widget.Events.FINISH, function() {
                    player.media.paused = true;
                    trigger(player.media, 'ended');
                });
            });
        }

        // Get the current speed value
        function getSpeedLabel(speed) {
            if (!utils.is.number(speed)) {
                speed = player.config.speed.selected;
            }

            if (speed === 1) {
                return 'Normal';
            }

            return speed + '&times;';
        }

        // Check playing state
        function checkPlaying() {
            utils.toggleClass(player.elements.container, player.config.classes.playing, !player.media.paused);

            utils.toggleClass(player.elements.container, player.config.classes.stopped, player.media.paused);

            player.toggleControls(player.media.paused);
        }

        // Show/hide menu
        function toggleMenu(event) {
            var form = player.elements.settings.form;
            var button = player.elements.buttons.settings;
            var show = utils.is.boolean(event) ? event : form.getAttribute('aria-hidden') === 'true';

            if (utils.is.event(event)) {
                var isMenuItem = form.contains(event.target);
                var isButton = event.target === player.elements.buttons.settings;

                // If the click was inside the form or if the click
                // wasn't the button or menu item and we're trying to
                // show the menu (a doc click shouldn't show the menu)
                if (isMenuItem || (!isMenuItem && !isButton && show)) {
                    return;
                }

                // Prevent the toggle being caught by the doc listener
                if (isButton) {
                    event.stopPropagation();
                }
            }

            // Set form and button attributes
            form.setAttribute('aria-hidden', !show);
            button.setAttribute('aria-expanded', show);

            if (show) {
                form.removeAttribute('tabindex');
            } else {
                form.setAttribute('tabindex', -1);
            }
        }

        // Get the natural size of a tab
        function getTabSize(tab) {
            var width;
            var height;

            var clone = tab.cloneNode(true);
            clone.style.position = "absolute";
            clone.style.opacity = 0;
            clone.setAttribute('aria-hidden', false);

            // Prevent input's being unchecked due to the name being identical
            [].forEach.call(clone.querySelectorAll('input[name]'), function(input) {
                var name = input.getAttribute('name');
                input.setAttribute('name', name + '-clone');
            });

            // Append to parent so we get the "real" size
            tab.parentNode.appendChild(clone);

            // Get the sizes before we remove
            width = clone.scrollWidth;
            height = clone.scrollHeight;

            // Remove from the DOM
            utils.removeElement(clone);

            return {
                width: width,
                height: height
            };
        }

        // Toggle Menu
        function showTab(event) {
            var menu = player.elements.settings.menu;
            var tab = event.target;
            var show = tab.getAttribute('aria-expanded') === 'false';
            var pane = document.getElementById(tab.getAttribute('aria-controls'));

            // Nothing to show, bail
            if (!utils.is.htmlElement(pane)) {
                return;
            }

            // Are we targetting a tab? If not, bail
            var isTab = pane.getAttribute('role') === 'tabpanel';
            if (!isTab) {
                return;
            }

            // Hide all other tabs
            // Get other tabs
            var current = menu.querySelector('[role="tabpanel"][aria-hidden="false"]');
            var container = current.parentNode;

            // Set other toggles to be expanded false
            [].forEach.call(menu.querySelectorAll('[aria-controls="' + current.getAttribute('id') + '"]'), function(toggle) {
                toggle.setAttribute('aria-expanded', false);
            });

            // If we can do fancy animations, we'll animate the height/width
            if (support.transitions && !support.reducedMotion) {
                // Set the current width as a base
                container.style.width = current.scrollWidth + 'px';
                container.style.height = current.scrollHeight + 'px';

                // Get potential sizes
                var size = getTabSize(pane);

                // Restore auto height/width
                var restore = function(event) {
                    // We're only bothered about height and width on the container
                    if (event.target !== container ||
                        !utils.inArray(['width', 'height'], event.propertyName)) {
                        return;
                    }

                    // Revert back to auto
                    container.style.width = '';
                    container.style.height = '';

                    // Only listen once
                    utils.off(container, utils.transitionEnd, restore)
                }

                // Listen for the transition finishing and restore auto height/width
                utils.on(container, utils.transitionEnd, restore);

                // Set dimensions to target
                container.style.width = size.width + 'px';
                container.style.height = size.height + 'px';
            }

            // Set attributes on current tab
            current.setAttribute('aria-hidden', true);
            current.setAttribute('tabindex', -1);

            // Set attributes on target
            pane.setAttribute('aria-hidden', !show);
            tab.setAttribute('aria-expanded', show);
            pane.removeAttribute('tabindex');
        }

        // Update volume UI and storage
        function updateVolume() {
            // Get the current volume
            var volume = player.media.muted ? 0 : (player.media.volume * 10);

            // Update the <input type="range"> if present
            if (player.supported.full) {
                if (player.elements.inputs.volume) {
                    player.elements.inputs.volume.value = volume;
                }
                if (player.elements.display.volume) {
                    player.elements.display.volume.value = volume;
                }
            }

            // Update the volume in storage
            updateStorage({
                volume: volume
            });

            // Toggle class if muted
            utils.toggleClass(player.elements.container, player.config.classes.muted, (volume === 0));

            // Update checkbox for mute state
            if (player.supported.full && player.elements.buttons.mute) {
                utils.toggleState(player.elements.buttons.mute, (volume === 0));
            }
        }

        // Check if media is loading
        function checkLoading(event) {
            player.loading = (event.type === 'waiting');

            // Clear timer
            clearTimeout(timers.loading);

            // Timer to prevent flicker when seeking
            timers.loading = setTimeout(function() {
                // Toggle container class hook
                utils.toggleClass(player.elements.container, player.config.classes.loading, player.loading);

                // Show controls if loading, hide if done
                player.toggleControls(player.loading);
            }, (player.loading ? 250 : 0));
        }

        // Update <progress> elements
        function updateProgress(event) {
            if (!player.supported.full) {
                return;
            }

            var progress = player.elements.display.played;
            var value = 0;
            var duration = player.getDuration();

            if (event) {
                switch (event.type) {
                    // Video playing
                    case 'timeupdate':
                    case 'seeking':
                        if (player.elements.controls.pressed) {
                            return;
                        }

                        value = utils.getPercentage(player.media.currentTime, duration);

                        // Set seek range value only if it's a 'natural' time event
                        if (event.type === 'timeupdate' && player.elements.inputs.seek) {
                            player.elements.inputs.seek.value = value;
                        }

                        break;

                        // Check buffer status
                    case 'playing':
                    case 'progress':
                        progress = player.elements.display.buffer;
                        value = (function() {
                            var buffered = player.media.buffered;

                            if (buffered && buffered.length) {
                                // HTML5
                                return utils.getPercentage(buffered.end(0), duration);
                            } else if (utils.is.number(buffered)) {
                                // YouTube returns between 0 and 1
                                return (buffered * 100);
                            }

                            return 0;
                        })();

                        break;
                }
            }

            // TODO: Loop - this shouldn't be here
            /*if (utils.is.number(player.config.loop.start) && utils.is.number(player.config.loop.end) && player.media.currentTime >= player.config.loop.end) {
                console.warn('Looping');
                player.seek(player.config.loop.start);
            }*/

            setProgress(progress, value);
        }

        // Set <progress> value
        function setProgress(progress, value) {
            if (!player.supported.full) {
                return;
            }

            // Default to 0
            if (utils.is.undefined(value)) {
                value = 0;
            }
            // Default to buffer or bail
            if (utils.is.undefined(progress)) {
                if (utils.is.htmlElement(player.elements.display.buffer)) {
                    progress = player.elements.display.buffer;
                } else {
                    return;
                }
            }

            // Update value and label
            if (utils.is.htmlElement(progress)) {
                progress.value = value;

                // Update text label inside
                var label = progress.getElementsByTagName('span')[0];
                if (utils.is.htmlElement(label)) {
                    label.childNodes[0].nodeValue = value;
                }
            }
        }

        // Update the displayed time
        function updateTimeDisplay(time, element) {
            // Bail if there's no duration display
            if (!element) {
                return;
            }

            // Fallback to 0
            if (isNaN(time)) {
                time = 0;
            }

            var secs = parseInt(time % 60);
            var mins = parseInt((time / 60) % 60);
            var hours = parseInt(((time / 60) / 60) % 60);
            var duration = player.getDuration();

            // Do we need to display hours?
            var displayHours = (parseInt(((duration / 60) / 60) % 60) > 0);

            // Ensure it's two digits. For example, 03 rather than 3.
            secs = ('0' + secs).slice(-2);
            mins = ('0' + mins).slice(-2);

            // Generate display
            var display = (displayHours ? hours + ':' : '') + mins + ':' + secs;

            // Render
            element.textContent = display;

            // Return for looping
            return display;
        }

        // Show the duration on metadataloaded
        function displayDuration() {
            if (!player.supported.full) {
                return;
            }

            // Determine duration
            var duration = player.getDuration() || 0;

            // If there's only one time display, display duration there
            if (!player.elements.display.duration && player.config.displayDuration && player.media.paused) {
                updateTimeDisplay(duration, player.elements.display.currentTime);
            }

            // If there's a duration element, update content
            if (player.elements.display.duration) {
                updateTimeDisplay(duration, player.elements.display.duration);
            }

            // Update the tooltip (if visible)
            updateSeekTooltip();
        }

        // Handle time change event
        function timeUpdate(event) {
            // Duration
            updateTimeDisplay(player.media.currentTime, player.elements.display.currentTime);

            // Ignore updates while seeking
            if (event && event.type === 'timeupdate' && player.media.seeking) {
                return;
            }

            // Playing progress
            updateProgress(event);
        }

        // Update seek range and progress
        function updateSeekDisplay(time) {
            // Default to 0
            if (!utils.is.number(time)) {
                time = 0;
            }

            var duration = player.getDuration();
            var value = utils.getPercentage(time, duration);

            // Update progress
            if (player.elements.progress && player.elements.display.played) {
                player.elements.display.played.value = value;
            }

            // Update seek range input
            if (player.elements.buttons && player.elements.inputs.seek) {
                player.elements.inputs.seek.value = value;
            }
        }

        // Update hover tooltip for seeking
        function updateSeekTooltip(event) {
            var duration = player.getDuration();

            // Bail if setting not true
            if (!player.config.tooltips.seek || !utils.is.htmlElement(player.elements.inputs.seek) || !utils.is.htmlElement(player.elements.display.seekTooltip) || duration === 0) {
                return;
            }

            // Calculate percentage
            var clientRect = player.elements.inputs.seek.getBoundingClientRect();
            var percent = 0;
            var visible = player.config.classes.tooltip + '--visible';

            // Determine percentage, if already visible
            if (utils.is.event(event)) {
                percent = ((100 / clientRect.width) * (event.pageX - clientRect.left));
            } else {
                if (utils.hasClass(player.elements.display.seekTooltip, visible)) {
                    percent = player.elements.display.seekTooltip.style.left.replace('%', '');
                } else {
                    return;
                }
            }

            // Set bounds
            if (percent < 0) {
                percent = 0;
            } else if (percent > 100) {
                percent = 100;
            }

            // Display the time a click would seek to
            updateTimeDisplay(((duration / 100) * percent), player.elements.display.seekTooltip);

            // Set position
            player.elements.display.seekTooltip.style.left = percent + "%";

            // Show/hide the tooltip
            // If the event is a moues in/out and percentage is inside bounds
            if (utils.is.event(event) && utils.inArray(['mouseenter', 'mouseleave'], event.type)) {
                utils.toggleClass(player.elements.display.seekTooltip, visible, (event.type === 'mouseenter'));
            }
        }

        // Update source
        // Sources are not checked for support so be careful
        function updateSource(source) {
            if (!utils.is.object(source) || !('sources' in source) || !source.sources.length) {
                warn('Invalid source format');
                return;
            }

            // Update seek range and progress
            updateSeekDisplay();

            // Reset buffer progress
            setProgress();

            // Cancel current network requests
            cancelRequests();

            // Destroy instance and re-setup
            player.destroy(function() {
                // Remove elements
                removeElement(player.media);
                removeElement('captions');
                removeElement('wrapper');

                // Reset class name
                if (player.elements.container) {
                    player.elements.container.removeAttribute('class');
                }

                // Set the type
                if ('type' in source) {
                    player.type = source.type;

                    // Get child type for video (it might be an embed)
                    if (player.type === 'video') {
                        var firstSource = source.sources[0];

                        if ('type' in firstSource && utils.inArray(types.embed, firstSource.type)) {
                            player.type = firstSource.type;
                        }
                    }
                }

                // Check for support
                player.supported = utils.checkSupport(player.type, player.config.inline);

                // Create new markup
                switch (player.type) {
                    case 'video':
                        player.media = utils.createElement('video');
                        break;

                    case 'audio':
                        player.media = utils.createElement('audio');
                        break;

                    case 'youtube':
                    case 'vimeo':
                    case 'soundcloud':
                        player.media = utils.createElement('div');
                        player.embedId = source.sources[0].src;
                        break;
                }

                // Inject the new element
                utils.prependChild(player.elements.container, player.media);

                // Autoplay the new source?
                if (utils.is.boolean(source.autoplay)) {
                    player.config.autoplay = source.autoplay;
                }

                // Set attributes for audio and video
                if (utils.inArray(types.html5, player.type)) {
                    if (player.config.crossorigin) {
                        player.media.setAttribute('crossorigin', '');
                    }
                    if (player.config.autoplay) {
                        player.media.setAttribute('autoplay', '');
                    }
                    if ('poster' in source) {
                        player.media.setAttribute('poster', source.poster);
                    }
                    if (player.config.loop.active) {
                        player.media.setAttribute('loop', '');
                    }
                    if (player.config.inline) {
                        player.media.setAttribute('playsinline', '');
                    }
                }

                // Restore class hooks
                utils.toggleClass(player.elements.container, player.config.classes.fullscreen.active, player.fullscreen.active);
                utils.toggleClass(player.elements.container, player.config.classes.captions.active, player.captions.enabled);
                toggleStyleHook();

                // Set new sources for html5
                if (utils.inArray(types.html5, player.type)) {
                    insertElements('source', source.sources);
                }

                // Set up from scratch
                setupMedia();

                // HTML5 stuff
                if (utils.inArray(types.html5, player.type)) {
                    // Setup captions
                    if ('tracks' in source) {
                        insertElements('track', source.tracks);
                    }

                    // Load HTML5 sources
                    player.media.load();
                }

                // If HTML5 or embed but not fully supported, setupInterface and call ready now
                if (utils.inArray(types.html5, player.type) || (utils.inArray(types.embed, player.type) && !player.supported.full)) {
                    // Setup interface
                    setupInterface();

                    // Call ready
                    ready();
                }

                // Set aria title and iframe title
                player.config.title = source.title;
                setTitle();
            }, false);
        }

        // Listen for control events
        function listeners() {
            // IE doesn't support input event, so we fallback to change
            var inputEvent = (player.browser.isIE ? 'change' : 'input');

            // Click play/pause helper
            function togglePlay() {
                var play = player.togglePlay();

                // Determine which buttons
                var trigger = player.elements.buttons[play ? 'play' : 'pause'];
                var target = player.elements.buttons[play ? 'pause' : 'play'];

                // Setup focus and tab focus
                if (target) {
                    var hadTabFocus = utils.hasClass(trigger, player.config.classes.tabFocus);

                    setTimeout(function() {
                        if (utils.is.htmlElement(target)) {
                            target.focus();
                        }

                        if (hadTabFocus) {
                            utils.toggleClass(trigger, player.config.classes.tabFocus, false);
                            utils.toggleClass(target, player.config.classes.tabFocus, true);
                        }
                    }, 100);
                }
            }

            // Get the key code for an event
            function getKeyCode(event) {
                return event.keyCode ? event.keyCode : event.which;
            }

            // Detect tab focus
            function checkTabFocus(focused) {
                utils.toggleClass(getElements('.' + player.config.classes.tabFocus), player.config.classes.tabFocus, false);

                if (player.elements.container.contains(focused)) {
                    utils.toggleClass(focused, player.config.classes.tabFocus, true);
                }
            }

            // Keyboard shortcuts
            if (player.config.keyboard.focused) {
                var last = null;

                // Handle global presses
                if (player.config.keyboard.global) {
                    utils.on(window, 'keydown keyup', function(event) {
                        var code = getKeyCode(event);
                        var focused = utils.getFocusElement();
                        var allowed = [48, 49, 50, 51, 52, 53, 54, 56, 57, 75, 77, 70, 67, 73, 76, 79];

                        // Only handle global key press if key is in the allowed keys
                        // and if the focused element is not editable (e.g. text input)
                        // and any that accept key input http://webaim.org/techniques/keyboard/
                        if (utils.inArray(allowed, code) && (!utils.is.htmlElement(focused) || !utils.matches(focused, player.config.selectors.editable))) {
                            handleKey(event);
                        }
                    }, false);
                }

                // Handle presses on focused
                utils.on(player.elements.container, 'keydown keyup', handleKey, false);
            }

            function handleKey(event) {
                var code = getKeyCode(event);
                var pressed = event.type === 'keydown';
                var held = pressed && code === last;

                // If the event is bubbled from the media element
                // Firefox doesn't get the keycode for whatever reason
                if (!utils.is.number(code)) {
                    return;
                }

                // Seek by the number keys
                function seekByKey() {
                    // Get current duration
                    var duration = player.media.duration;

                    // Bail if we have no duration set
                    if (!utils.is.number(duration)) {
                        return;
                    }

                    // Divide the max duration into 10th's and times by the number value
                    player.seek((duration / 10) * (code - 48));
                }

                // Handle the key on keydown
                // Reset on keyup
                if (pressed) {
                    // Which keycodes should we prevent default
                    var preventDefault = [48, 49, 50, 51, 52, 53, 54, 56, 57, 32, 75, 38, 40, 77, 39, 37, 70, 67, 73, 76, 79];
                    var checkFocus = [38, 40];

                    if (utils.inArray(checkFocus, code)) {
                        var focused = utils.getFocusElement();

                        if (utils.is.htmlElement(focused) && utils.getFocusElement().type === "radio") {
                            return;
                        }
                    }

                    // If the code is found prevent default (e.g. prevent scrolling for arrows)
                    if (utils.inArray(preventDefault, code)) {
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    switch (code) {
                        case 48:
                        case 49:
                        case 50:
                        case 51:
                        case 52:
                        case 53:
                        case 54:
                        case 55:
                        case 56:
                        case 57:
                            // 0-9
                            if (!held) {
                                seekByKey();
                            }
                            break;

                        case 32:
                        case 75:
                            // Space and K key
                            if (!held) {
                                togglePlay();
                            }
                            break;

                        case 38:
                            // Arrow up
                            player.increaseVolume();
                            break;

                        case 40:
                            // Arrow down
                            player.decreaseVolume();
                            break;

                        case 77:
                            // M key
                            if (!held) {
                                player.toggleMute();
                            }
                            break;

                        case 39:
                            // Arrow forward
                            player.forward();
                            break;

                        case 37:
                            // Arrow back
                            player.rewind();
                            break;

                        case 70:
                            // F key
                            player.toggleFullscreen();
                            break;

                        case 67:
                            // C key
                            if (!held) {
                                player.toggleCaptions();
                            }
                            break;

                        case 73:
                            player.loop('start');
                            break;

                        case 76:
                            player.loop();
                            break;

                        case 79:
                            player.loop('end');
                            break;
                    }

                    // Escape is handle natively when in full screen
                    // So we only need to worry about non native
                    if (!support.fullscreen && player.fullscreen.active && code === 27) {
                        player.toggleFullscreen();
                    }

                    // Store last code for next cycle
                    last = code;
                } else {
                    last = null;
                }
            }

            // Focus/tab management
            utils.on(window, 'keyup', function(event) {
                var code = getKeyCode(event);
                var focused = utils.getFocusElement();

                if (code === 9) {
                    checkTabFocus(focused);
                }
            });
            utils.on(document.body, 'click', function() {
                utils.toggleClass(getElement('.' + player.config.classes.tabFocus), player.config.classes.tabFocus, false);
            });
            for (var button in player.elements.buttons) {
                var element = player.elements.buttons[button];

                utils.on(element, 'blur', function() {
                    utils.toggleClass(element, 'tab-focus', false);
                });
            }

            // Trigger custom and default handlers
            var handlerProxy = function(event, customHandler, defaultHandler) {
                if (utils.is.function(customHandler)) {
                    customHandler.call(this, event);
                }
                if (utils.is.function(defaultHandler)) {
                    defaultHandler.call(this, event);
                }
            }

            // Play
            utils.proxy(player.elements.buttons.play, 'click', player.config.listeners.play, togglePlay);
            utils.proxy(player.elements.buttons.playLarge, 'click', player.config.listeners.play, togglePlay);

            // Pause
            utils.proxy(player.elements.buttons.pause, 'click', player.config.listeners.pause, togglePlay);

            // Pause
            utils.proxy(player.elements.buttons.restart, 'click', player.config.listeners.restart, function() {
                player.restart();
            });

            // Rewind
            utils.proxy(player.elements.buttons.rewind, 'click', player.config.listeners.rewind, function() {
                player.rewind();
            });

            // Rewind
            utils.proxy(player.elements.buttons.forward, 'click', player.config.listeners.forward, function() {
                player.forward();
            });

            // Mute
            utils.proxy(player.elements.buttons.mute, 'click', player.config.listeners.mute, function() {
                player.toggleMute();
            });

            // Captions
            utils.proxy(player.elements.buttons.captions, 'click', player.config.listeners.captions, function() {
                player.toggleCaptions();
            });

            // Fullscreen
            utils.proxy(player.elements.buttons.fullscreen, 'click', player.config.listeners.fullscreen, function(event) {
                player.toggleFullscreen(event);
            });

            // Picture-in-Picture
            utils.proxy(player.elements.buttons.pip, 'click', player.config.listeners.pip, function() {
                player.togglePictureInPicture();
            });

            // Airplay
            utils.proxy(player.elements.buttons.airplay, 'click', player.config.listeners.airplay, function() {
                player.airPlay();
            });

            // Settings menu
            utils.on(player.elements.buttons.settings, 'click', toggleMenu);

            // Click anywhere closes menu
            utils.on(document.documentElement, 'click', toggleMenu);

            // Show tab in menu
            utils.on(player.elements.settings.form, 'click', showTab);

            // Settings menu items - use event delegation as items are added/removed
            utils.on(player.elements.settings.form, 'click', function(event) {
                // Settings - Language
                if (utils.matches(event.target, player.config.selectors.inputs.language)) {
                    handlerProxy.call(this, event, player.config.listeners.language, function() {
                        player.setLanguage(event.target.value.toLowerCase());
                    });
                }

                // Settings - Quality
                else if (utils.matches(event.target, player.config.selectors.inputs.quality)) {
                    handlerProxy.call(this, event, player.config.listeners.quality, function() {
                        player.setQuality(event.target.value);
                    });
                }

                // Settings - Speed
                else if (utils.matches(event.target, player.config.selectors.inputs.speed)) {
                    handlerProxy.call(this, event, player.config.listeners.speed, function() {
                        player.setSpeed(parseFloat(event.target.value));
                    });
                }

                // Settings - Looping
                // TODO: use toggle buttons
                else if (utils.matches(event.target, player.config.selectors.buttons.loop)) {
                    handlerProxy.call(this, event, player.config.listeners.loop, function() {
                        // TODO: This should be done in the method itself I think
                        // var value = event.target.getAttribute('data-loop__value') || event.target.getAttribute('data-loop__type');

                        warn('Set loop');

                        /*if (utils.inArray(['start', 'end', 'all', 'none'], value)) {
                            player.loop(value);
                        }*/
                    });
                }
            });

            // Seek
            utils.proxy(player.elements.inputs.seek, inputEvent, player.config.listeners.seek, function(event) {
                var duration = player.getDuration();
                player.seek((event.target.value / event.target.max) * duration);
            });

            // Seek
            utils.proxy(player.elements.inputs.volume, inputEvent, player.config.listeners.volume, function() {
                player.setVolume(event.target.value);
            });

            // Seek tooltip
            utils.on(player.elements.progress, 'mouseenter mouseleave mousemove', updateSeekTooltip);

            // Toggle controls visibility based on mouse movement
            if (player.config.hideControls) {
                // Toggle controls on mouse events and entering fullscreen
                utils.on(player.elements.container, 'mouseenter mouseleave mousemove touchstart touchend touchcancel touchmove enterfullscreen', function(event) {
                    player.toggleControls(event);
                });

                // Watch for cursor over controls so they don't hide when trying to interact
                utils.on(player.elements.controls, 'mouseenter mouseleave', function(event) {
                    player.elements.controls.hover = event.type === 'mouseenter';
                });

                // Watch for cursor over controls so they don't hide when trying to interact
                utils.on(player.elements.controls, 'mousedown mouseup touchstart touchend touchcancel', function(event) {
                    player.elements.controls.pressed = utils.inArray(['mousedown', 'touchstart'], event.type);
                });

                // Focus in/out on controls
                // TODO: Check we need capture here
                utils.on(player.elements.controls, 'focus blur', function(event) {
                    player.toggleControls(event);
                }, true, true);
            }

            // Mouse wheel for volume
            utils.proxy(player.elements.inputs.volume, 'wheel', player.config.listeners.volume, function(event) {
                // Detect "natural" scroll - suppored on OS X Safari only
                // Other browsers on OS X will be inverted until support improves
                var inverted = event.webkitDirectionInvertedFromDevice;
                var step = (1 / 5);
                var direction = 0;

                // Scroll down (or up on natural) to decrease
                if (event.deltaY < 0 || event.deltaX > 0) {
                    if (inverted) {
                        player.decreaseVolume(step);
                        direction = -1;
                    } else {
                        player.increaseVolume(step);
                        direction = 1;
                    }
                }

                // Scroll up (or down on natural) to increase
                if (event.deltaY > 0 || event.deltaX < 0) {
                    if (inverted) {
                        player.increaseVolume(step);
                        direction = 1;
                    } else {
                        player.decreaseVolume(step);
                        direction = -1;
                    }
                }

                // Don't break page scrolling at max and min
                if ((direction === 1 && player.media.volume < 1) ||
                    (direction === -1 && player.media.volume > 0)) {
                    event.preventDefault();
                }
            }, false);

            // Handle user exiting fullscreen by escaping etc
            if (support.fullscreen) {
                utils.on(document, fullscreen.eventType, function(event) {
                    player.toggleFullscreen(event);
                });
            }
        }

        // Listen for media events
        function mediaListeners() {
            // Time change on media
            utils.on(player.media, 'timeupdate seeking', timeUpdate);

            // Display duration
            utils.on(player.media, 'durationchange loadedmetadata', displayDuration);

            // Handle the media finishing
            utils.on(player.media, 'ended', function() {
                // Show poster on end
                if (player.type === 'video' && player.config.showPosterOnEnd) {
                    // Clear
                    if (player.type === 'video') {
                        setCaption();
                    }

                    // Restart
                    player.restart();

                    // Re-load media
                    player.media.load();
                }
            });

            // Check for buffer progress
            utils.on(player.media, 'progress playing', updateProgress);

            // Handle native mute
            utils.on(player.media, 'volumechange', updateVolume);

            // Handle native play/pause
            utils.on(player.media, 'play pause ended', checkPlaying);

            // Loading
            utils.on(player.media, 'waiting canplay seeked', checkLoading);

            // Click video
            if (player.config.clickToPlay && player.type !== 'audio') {
                // Re-fetch the wrapper
                var wrapper = getElement('.' + player.config.classes.video);

                // Bail if there's no wrapper (this should never happen)
                if (!wrapper) {
                    return;
                }

                // Set cursor
                wrapper.style.cursor = "pointer";

                // On click play, pause ore restart
                utils.on(wrapper, 'click', function() {
                    // Touch devices will just show controls (if we're hiding controls)
                    if (player.config.hideControls && support.touch && !player.media.paused) {
                        return;
                    }

                    if (player.media.paused) {
                        player.play();
                    } else if (player.media.ended) {
                        player.restart();
                        player.play();
                    } else {
                        player.pause();
                    }
                });
            }

            // Disable right click
            if (player.config.disableContextMenu) {
                utils.on(player.media, 'contextmenu', function(event) {
                    event.preventDefault();
                }, false);
            }

            // Speed change
            utils.on(player.media, 'ratechange', function(event) {
                // Store current speed
                player.config.speed.selected = player.media.playbackRate;

                // Update UI
                setSelectedSpeed();

                // Save speed to localStorage
                updateStorage({
                    speed: player.config.speed.selected
                });
            });

            // Proxy events to container
            // Bubble up key events for Edge
            utils.on(player.media, player.config.events.concat(['keyup', 'keydown']).join(' '), function(event) {
                trigger(player.elements.container, event.type, true);
            });
        }

        // Cancel current network requests
        // See https://github.com/sampotts/plyr/issues/174
        function cancelRequests() {
            if (!utils.inArray(types.html5, player.type)) {
                return;
            }

            // Remove child sources
            var sources = player.media.querySelectorAll('source');
            for (var i = 0; i < sources.length; i++) {
                utils.removeElement(sources[i]);
            }

            // Set blank video src attribute
            // This is to prevent a MEDIA_ERR_SRC_NOT_SUPPORTED error
            // Info: http://stackoverflow.com/questions/32231579/how-to-properly-dispose-of-an-html5-video-and-close-socket-or-connection
            player.media.setAttribute('src', 'https://cdn.selz.com/plyr/blank.mp4');

            // Load the new empty source
            // This will cancel existing requests
            // See https://github.com/sampotts/plyr/issues/174
            player.media.load();

            // Debugging
            log('Cancelled network requests');
        }

        // Setup the UI
        function setupInterface() {
            // Don't setup interface if no support
            if (!player.supported.full) {
                warn('Basic support only', player.type);

                // Remove controls
                removeElement('controls');

                // Remove large play
                removeElement('buttons.play');

                // Restore native controls
                toggleNativeControls(true);

                // Bail
                return;
            }

            // Inject custom controls if not present
            if (!utils.is.htmlElement(player.elements.controls)) {
                // Inject custom controls
                injectControls();

                // Re-attach listeners
                listeners();
            }

            // If there's no controls, bail
            if (!utils.is.htmlElement(player.elements.controls)) {
                return;
            }

            // Media element listeners
            mediaListeners();

            // Remove native controls
            toggleNativeControls();

            // Setup fullscreen
            setupFullscreen();

            // Captions
            setupCaptions();

            // Set volume
            player.setVolume();
            updateVolume();

            // Set playback speed
            player.setSpeed();

            // Set loop
            player.loop();

            // Reset time display
            timeUpdate();

            // Update the UI
            checkPlaying();
        }

        // Everything done
        function ready() {
            player.ready = true;

            // Ready event at end of execution stack
            window.setTimeout(function() {
                trigger(player.elements.container, 'ready', true);
            }, 0);

            // Autoplay
            if (player.config.autoplay) {
                player.play();
            }
        }

        // Setup a player
        function setup(media) {
            // We need an element to setup
            if (media === null || utils.is.undefined(media) || !utils.is.htmlElement(media)) {
                error('Setup failed: no suitable element passed');
                return;
            }

            // Bail if the element is initialized
            if (media.plyr) {
                warn('Target already setup');
                player = media.plyr;
                return;
            }

            // Bail if not enabled
            if (!player.config.enabled) {
                error('Setup failed: disabled by config');
                return;
            }

            // Bail if disabled or no basic support
            // You may want to disable certain UAs etc
            if (!utils.checkSupport().basic) {
                error('Setup failed: no support');
                return;
            }

            // Cache original element state for .destroy()
            player.elements.original = media.cloneNode(true);

            // Set media type based on tag or data attribute
            // Supported: video, audio, vimeo, youtube
            var type = media.tagName.toLowerCase();

            // Different setup based on type
            switch (type) {
                case 'div':
                    player.type = media.getAttribute('data-type');
                    player.embedId = media.getAttribute('data-video-id');

                    if (utils.is.empty(player.type)) {
                        error('Setup failed: embed type missing');
                        return;
                    }

                    if (utils.is.empty(player.embedId)) {
                        error('Setup failed: video id missing');
                        return;
                    }

                    // Clean up
                    media.removeAttribute('data-type');
                    media.removeAttribute('data-video-id');
                    break;

                case 'iframe':
                    // TODO: Handle passing an iframe for true progressive enhancement
                    break;

                case 'video':
                case 'audio':
                    player.type = type;
                    player.config.crossorigin = media.getAttribute('crossorigin') !== null;
                    player.config.autoplay = player.config.autoplay || (media.getAttribute('autoplay') !== null);
                    player.config.inline = media.getAttribute('playsinline') !== null;
                    player.config.loop.active = player.config.loop || (media.getAttribute('loop') !== null);
                    break;

                default:
                    error('Setup failed: unsupported type');
                    return;
            }

            // Sniff out the browser
            player.browser = utils.getBrowser();

            // Load saved settings from localStorage
            setupStorage();

            // Check for support again but with type
            player.supported = utils.checkSupport(player.type, player.config.inline);

            // If no native support, bail
            if (!player.supported.basic) {
                error('Setup failed: no support');
                return;
            }

            // Store reference
            media.plyr = player;

            // Wrap media
            player.elements.container = utils.wrap(media, utils.createElement('div'));

            // Allow focus to be captured
            player.elements.container.setAttribute('tabindex', 0);

            // Add style hook
            toggleStyleHook();

            // Debug info
            log(player.browser.name + ' ' + player.browser.version);

            // Setup media
            setupMedia();

            // Listen for events if debugging
            if (player.config.debug) {
                var events = player.config.events.concat(['setup', 'statechange', 'enterfullscreen', 'exitfullscreen', 'captionsenabled', 'captionsdisabled']);

                utils.on(player.elements.container, events.join(' '), function(event) {
                    log('event: ' + event.type);
                });
            }

            // Setup interface
            // If embed but not fully supported, setupInterface (to avoid flash of controls) and call ready now
            if (utils.inArray(types.html5, player.type) || (utils.inArray(types.embed, player.type) && !player.supported.full)) {
                // Setup UI
                setupInterface();

                // Call ready
                ready();

                // Set title on button and frame
                setTitle();
            }
        }

        // Expose some core functions
        player.core = {
            getElement: getElement,
            getElements: getElements,
            trigger: trigger,
            setCaption: setCaption,
            setupCaptions: setupCaptions,
            toggleNativeControls: toggleNativeControls,
            updateTimeDisplay: updateTimeDisplay,
            updateSeekDisplay: updateSeekDisplay,
            updateSource: updateSource,
            updateStorage: updateStorage,
            timers: timers,
            support: support,

            // Debugging
            log: log,
            warn: warn,
            error: error
        };

        // Initialize instance
        setup(player.media);
    }

    // API
    // ---------------------------------------
    // Play
    Plyr.prototype.play = function() {
        var player = this;

        if ('play' in player.media) {
            player.media.play();
        }

        // Allow chaining
        return player;
    };

    // Pause
    Plyr.prototype.pause = function() {
        var player = this;

        if ('pause' in player.media) {
            player.media.pause();
        }

        // Allow chaining
        return player;
    };

    // Toggle playback
    Plyr.prototype.togglePlay = function(toggle) {
        var player = this;

        // True toggle if nothing passed
        if (!utils.is.boolean(toggle)) {
            toggle = player.media.paused;
        }

        if (toggle) {
            player.play();
        } else {
            player.pause();
        }

        return toggle;
    };

    // Stop
    Plyr.prototype.stop = function() {
        var player = this;

        player.restart();
        player.pause();

        // Allow chaining
        return player;
    };

    // Restart
    Plyr.prototype.restart = function() {
        var player = this;

        // Seek to 0
        player.seek();

        // Allow chaining
        return player;
    };

    // Rewind
    Plyr.prototype.rewind = function(seekTime) {
        var player = this;

        // Use default if needed
        if (!utils.is.number(seekTime)) {
            seekTime = player.config.seekTime;
        }

        player.seek(player.media.currentTime - seekTime);

        // Allow chaining
        return player;
    };

    // Fast forward
    Plyr.prototype.forward = function(seekTime) {
        var player = this;

        // Use default if needed
        if (!utils.is.number(seekTime)) {
            seekTime = player.config.seekTime;
        }

        player.seek(player.media.currentTime + seekTime);

        // Allow chaining
        return player;
    };

    // Seek to time
    // The input parameter can be an event or a number
    Plyr.prototype.seek = function(input) {
        var player = this;
        var targetTime = 0;
        var paused = player.media.paused;
        var duration = player.getDuration();

        if (utils.is.number(input)) {
            targetTime = input;
        }

        // Normalise targetTime
        if (targetTime < 0) {
            targetTime = 0;
        } else if (targetTime > duration) {
            targetTime = duration;
        }

        // Update seek range and progress
        player.core.updateSeekDisplay(targetTime);

        // Set the current time
        // Embeds
        if (utils.inArray(types.embed, player.type)) {
            console.warn(player.type, typeof player.embed, typeof player.embed.seekTo);

            switch (player.type) {
                case 'youtube':
                    player.embed.seekTo(targetTime);
                    break;

                case 'vimeo':
                    player.embed.setCurrentTime(targetTime);
                    break;

                case 'soundcloud':
                    player.embed.seekTo(targetTime * 1000);
                    break;
            }

            if (paused) {
                player.pause();
            }

            // Trigger timeupdate
            player.core.trigger(player.media, 'timeupdate');

            // Set seeking flag
            player.media.seeking = true;

            // Trigger seeking
            player.core.trigger(player.media, 'seeking');
        } else {
            player.media.currentTime = targetTime.toFixed(4);
        }

        // Logging
        player.core.log('Seeking to ' + player.media.currentTime + ' seconds');

        // Allow chaining
        return player;
    };

    // Set volume
    Plyr.prototype.setVolume = function(volume) {
        var player = this;
        var max = 10;
        var min = 0;

        // Load volume from storage if no value specified
        if (utils.is.undefined(volume)) {
            volume = player.storage.volume;
        }

        // Use config if all else fails
        if (volume === null || isNaN(volume)) {
            volume = player.config.volume;
        }

        // Maximum is volumeMax
        if (volume > max) {
            volume = max;
        }
        // Minimum is volumeMin
        if (volume < min) {
            volume = min;
        }

        // Set the player volume
        player.media.volume = parseFloat(volume / max);

        // Set the display
        if (player.elements.display.volume) {
            player.elements.display.volume.value = volume;
        }

        // Embeds
        if (utils.inArray(types.embed, player.type)) {
            switch (player.type) {
                case 'youtube':
                    player.embed.setVolume(player.media.volume * 100);
                    break;

                case 'vimeo':
                case 'soundcloud':
                    player.embed.setVolume(player.media.volume);
                    break;
            }

            // Trigger volumechange for embeds
            player.core.trigger(player.media, 'volumechange');
        }

        // Toggle muted state
        if (volume === 0) {
            player.media.muted = true;
        } else if (player.media.muted && volume > 0) {
            player.toggleMute();
        }

        // Allow chaining
        return player;
    };

    // Increase volume
    Plyr.prototype.increaseVolume = function(step) {
        var player = this;
        var volume = player.media.muted ? 0 : (player.media.volume * 10);

        if (!utils.is.number(step)) {
            step = 1;
        }

        player.setVolume(volume + step);

        // Allow chaining
        return player;
    };

    // Decrease volume
    Plyr.prototype.decreaseVolume = function(step) {
        var player = this;
        var volume = player.media.muted ? 0 : (player.media.volume * 10);

        if (!utils.is.number(step)) {
            step = 1;
        }

        player.setVolume(volume - step);

        // Allow chaining
        return player;
    };

    // Toggle mute
    Plyr.prototype.toggleMute = function(muted) {
        var player = this;

        // If the method is called without parameter, toggle based on current value
        if (!utils.is.boolean(muted)) {
            muted = !player.media.muted;
        }

        // Set button state
        utils.toggleState(player.elements.buttons.mute, muted);

        // Set mute on the player
        player.media.muted = muted;

        // If volume is 0 after unmuting, set to default
        if (player.media.volume === 0) {
            player.volume(player.config.volume);
        }

        // Embeds
        if (utils.inArray(types.embed, player.type)) {
            switch (player.type) {
                case 'youtube':
                    player.embed[player.media.muted ? 'mute' : 'unMute']();
                    break;

                case 'vimeo':
                case 'soundcloud':
                    player.embed.setVolume(player.media.muted ? 0 : parseFloat(player.config.volume / 10));
                    break;
            }

            // Trigger volumechange for embeds
            player.core.trigger(player.media, 'volumechange');
        }

        // Allow chaining
        return player;
    };

    // Set playback speed
    Plyr.prototype.setSpeed = function(speed) {
        var player = this;

        // Load speed from storage or default value
        if (!utils.is.number(speed)) {
            speed = parseFloat(player.storage.speed || player.config.speed.selected);
        }

        // Set min/max
        if (speed < 0.1) {
            speed = 0.1;
        }
        if (speed > 2.0) {
            speed = 2.0;
        }

        if (!utils.inArray(player.config.speed.options, speed)) {
            player.core.warn('Unsupported speed (' + speed + ')');
            return;
        }

        // Set media speed
        switch (player.type) {
            case 'youtube':
                player.embed.setPlaybackRate(speed);
                break;

            case 'vimeo':
                speed = null;
                // Vimeo not supported (https://github.com/vimeo/player.js)
                player.core.warn('Vimeo playback rate change is not supported');
                break;

            default:
                player.media.playbackRate = speed;
                break;
        }

        // Save speed to localStorage
        player.core.updateStorage({
            speed: speed
        });

        // Allow chaining
        return player;
    };

    // Set playback quality
    Plyr.prototype.setQuality = function(quality) {
        var player = this;

        // Load speed from storage or default value
        if (!utils.is.string(quality)) {
            quality = parseFloat(player.storage.quality || player.config.quality.selected);
        }

        if (!utils.inArray(player.config.quality.options, quality)) {
            player.core.warn('Unsupported quality option (' + quality + ')');
            return;
        }

        // Set media speed
        switch (player.type) {
            case 'youtube':
                player.embed.setPlaybackQuality(quality);
                break;

            default:
                player.core.warn('Quality options are only available for YouTube');
                break;
        }

        // Save speed to localStorage
        player.core.updateStorage({
            quality: quality
        });

        // Allow chaining
        return player;
    };

    // Toggle loop
    // TODO: Finish logic
    // TODO: Set the indicator on load as user may pass loop as config
    Plyr.prototype.loop = function(type) {
        var player = this;

        // Set default to be a true toggle
        if (!utils.inArray(['start', 'end', 'all', 'none', 'toggle'], type)) {
            type = 'toggle';
        }

        var currentTime = Number(player.media.currentTime);

        switch (type) {
            case 'start':
                if (player.config.loop.end && player.config.loop.end <= currentTime) {
                    player.config.loop.end = null;
                }
                player.config.loop.start = currentTime;
                player.config.loop.indicator.start = player.elements.display.played.value;
                break;

            case 'end':
                if (player.config.loop.start >= currentTime) {
                    return;
                }
                player.config.loop.end = currentTime;
                player.config.loop.indicator.end = player.elements.display.played.value;
                break;

            case 'all':
                player.config.loop.start = 0;
                player.config.loop.end = player.media.duration - 2;
                player.config.loop.indicator.start = 0;
                player.config.loop.indicator.end = 100;
                break;

            case 'toggle':
                if (player.config.loop.active) {
                    player.config.loop.start = 0;
                    player.config.loop.end = null;
                } else {
                    player.config.loop.start = 0;
                    player.config.loop.end = player.media.duration - 2;
                }
                break;

            default:
                player.config.loop.start = 0;
                player.config.loop.end = null;
                break;
        }

        // Check if can loop
        player.config.loop.active = utils.is.number(player.config.loop.start) && utils.is.number(player.config.loop.end);
        var start = player.core.updateTimeDisplay(player.config.loop.start, player.core.getElement('[data-plyr-loop="start"]'));
        var end = null;

        if (utils.is.number(player.config.loop.end)) {
            // Find the <span> inside button
            end = player.core.updateTimeDisplay(player.config.loop.end, player.core.getElement('[data-loop__value="loopout"]'));
        } else {
            // Find the <span> inside button
            //end = document.querySelector('[data-loop__value="loopout"]').innerHTML = '';
        }

        if (player.config.loop.active) {
            // TODO: Improve the design of the loop indicator and put styling in CSS where it's meant to be
            //getElement('[data-menu="loop"]').innerHTML = start + ' - ' + end;
            //getElement(player.config.selectors.progress.looped).style.position = 'absolute';
            //getElement(player.config.selectors.progress.looped).style.left = player.config.loopinPositionPercentage + '%';
            //getElement(player.config.selectors.progress.looped).style.width = (player.config.loopoutPositionPercentage - player.config.loopinPositionPercentage) + '%';
            //getElement(player.config.selectors.progress.looped).style.background = '#ffbb00';
            //getElement(player.config.selectors.progress.looped).style.height = '3px';
            //getElement(player.config.selectors.progress.looped).style.top = '3px';
            //getElement(player.config.selectors.progress.looped).style['border-radius'] = '100px';
        } else {
            //getElement('[data-menu="loop"]').innerHTML = player.config.i18n.loopNone;
            //getElement(player.config.selectors.progress.looped).style.width = '0px';
        }

        // Allow chaining
        return player;
    };

    // Add common function to retrieve media source
    Plyr.prototype.source = function(source) {
        var player = this;

        // If object or string, parse it
        if (utils.is.object(source)) {
            player.core.updateSource(source);
            return player;
        }

        // Return the current source
        var url;

        switch (player.type) {
            case 'youtube':
                url = player.embed.getVideoUrl();
                break;

            case 'vimeo':
                player.embed.getVideoUrl.then(function(value) {
                    url = value;
                });
                break;

            case 'soundcloud':
                player.embed.getCurrentSound(function(object) {
                    url = object.permalink_url;
                });
                break;

            default:
                url = player.media.currentSrc;
                break;
        }

        return url;
    };

    // Set or get poster
    Plyr.prototype.poster = function(source) {
        var player = this;

        if (!utils.is.string(source)) {
            return player.media.getAttribute('poster');
        } else if (player.type === 'video') {
            player.media.setAttribute('poster', source);
        } else {
            player.core.warn('Poster can only be set on HTML5 video');
        }

        // Allow chaining
        return player;
    };

    // Toggle captions
    Plyr.prototype.toggleCaptions = function(show) {
        var player = this;

        // If there's no full support, or there's no caption toggle
        if (!player.supported.full || !player.elements.buttons.captions) {
            return;
        }

        // If the method is called without parameter, toggle based on current value
        if (!utils.is.boolean(show)) {
            show = (player.elements.container.className.indexOf(player.config.classes.captions.active) === -1);
        }

        // Set global
        player.captions.enabled = show;

        // Toggle state
        utils.toggleState(player.elements.buttons.captions, player.captions.enabled);

        // Add class hook
        utils.toggleClass(player.elements.container, player.config.classes.captions.active, player.captions.enabled);

        // Trigger an event
        player.core.trigger(player.elements.container, player.captions.enabled ? 'captionsenabled' : 'captionsdisabled', true);

        // Save captions state to localStorage
        player.core.updateStorage({
            captions: player.captions.enabled
        });

        // Allow chaining
        return player;
    };

    // Set caption language
    Plyr.prototype.setLanguage = function(language) {
        var player = this;

        // Nothing specified
        if (!utils.is.string(language)) {
            player.core.warn('Language is required');
            return;
        }

        // Update config
        player.config.captions.language = language.toLowerCase();

        // Clear caption
        player.core.setCaption();

        // Re-run setup
        player.core.setupCaptions();

        // Allow chaining
        return player;
    };

    // Get current language
    Plyr.prototype.getLanguage = function() {
        return this.config.captions.language;
    };

    // Toggle fullscreen
    // Requires user input event
    Plyr.prototype.toggleFullscreen = function(event) {
        var player = this;

        // Save scroll position
        function saveScrollPosition() {
            scroll = {
                x: window.pageXOffset || 0,
                y: window.pageYOffset || 0
            };
        }

        // Restore scroll position
        function restoreScrollPosition() {
            window.scrollTo(scroll.x, scroll.y);
        }

        // Check for native support
        var nativeSupport = support.fullscreen;

        if (nativeSupport) {
            // If it's a fullscreen change event, update the UI
            if (utils.is.event(event) && event.type === fullscreen.eventType) {
                player.fullscreen.active = fullscreen.isFullScreen(player.elements.container);
            } else {
                // Else it's a user request to enter or exit
                if (!fullscreen.isFullScreen(player.elements.container)) {
                    // Save scroll position
                    saveScrollPosition();

                    // Request full screen
                    fullscreen.requestFullScreen(player.elements.container);
                } else {
                    // Bail from fullscreen
                    fullscreen.cancelFullScreen();
                }

                // Check if we're actually full screen (it could fail)
                player.fullscreen.active = fullscreen.isFullScreen(player.elements.container);

                return;
            }
        } else {
            // Otherwise, it's a simple toggle
            player.fullscreen.active = !player.fullscreen.active;

            // Bind/unbind escape key
            document.body.style.overflow = player.fullscreen.active ? 'hidden' : '';
        }

        // Set class hook
        utils.toggleClass(player.elements.container, player.config.classes.fullscreen.active, player.fullscreen.active);

        // Set button state
        if (player.elements.buttons && player.elements.buttons.fullscreen) {
            utils.toggleState(player.elements.buttons.fullscreen, player.fullscreen.active);
        }

        // Trigger an event
        player.core.trigger(player.elements.container, player.fullscreen.active ? 'enterfullscreen' : 'exitfullscreen', true);

        // Restore scroll position
        if (!player.fullscreen.active && nativeSupport) {
            restoreScrollPosition();
        }

        // Allow chaining
        return player;
    };

    // Toggle picture-in-picture
    // TODO: update player with state, support, enabled
    // TODO: detect outside changes
    Plyr.prototype.togglePictureInPicture = function(toggle) {
        var player = this;
        var states = {
            pip: 'picture-in-picture',
            inline: 'inline'
        };

        // Bail if no support
        if (!player.core.support.pip) {
            return;
        }

        // Toggle based on current state if not passed
        if (!utils.is.boolean(toggle)) {
            toggle = player.media.webkitPresentationMode === states.inline;
        }

        // Toggle based on current state
        player.media.webkitSetPresentationMode(toggle ? states.pip : states.inline);

        // Allow chaining
        return player;
    };

    // Trigger airplay
    // TODO: update player with state, support, enabled
    Plyr.prototype.airPlay = function() {
        var player = this;

        // Bail if no support
        if (!player.core.support.airplay) {
            return;
        }

        // Show dialog
        player.media.webkitShowPlaybackTargetPicker();

        // Allow chaining
        return player;
    };

    // Show the player controls in fullscreen mode
    Plyr.prototype.toggleControls = function(toggle) {
        var player = this;

        // Don't hide if config says not to, it's audio, or not ready or loading
        if (!player.config.hideControls || player.type === 'audio') {
            return;
        }

        var delay = 0;
        var show = toggle;
        var isEnterFullscreen = false;
        var loading = utils.hasClass(player.elements.container, player.config.classes.loading);

        // Default to false if no boolean
        if (!utils.is.boolean(toggle)) {
            if (utils.is.event(toggle)) {
                // Is the enter fullscreen event
                isEnterFullscreen = (toggle.type === 'enterfullscreen');

                // Whether to show controls
                show = utils.inArray(['mousemove', 'touchstart', 'mouseenter', 'focus'], toggle.type);

                // Delay hiding on move events
                if (utils.inArray(['mousemove', 'touchmove'], toggle.type)) {
                    delay = 2000;
                }

                // Delay a little more for keyboard users
                if (toggle.type === 'focus') {
                    delay = 3000;
                }
            } else {
                show = utils.hasClass(player.elements.container, player.config.classes.hideControls);
            }
        }

        // Clear timer every movement
        window.clearTimeout(player.core.timers.hover);

        // If the mouse is not over the controls, set a timeout to hide them
        if (show || player.media.paused || loading) {
            utils.toggleClass(player.elements.container, player.config.classes.hideControls, false);

            // Always show controls when paused or if touch
            if (player.media.paused || loading) {
                return;
            }

            // Delay for hiding on touch
            if (support.touch) {
                delay = 3000;
            }
        }

        // If toggle is false or if we're playing (regardless of toggle),
        // then set the timer to hide the controls
        if (!show || !player.media.paused) {
            player.core.timers.hover = window.setTimeout(function() {
                // If the mouse is over the controls (and not entering fullscreen), bail
                if ((player.elements.controls.pressed || player.elements.controls.hover) && !isEnterFullscreen) {
                    return;
                }

                utils.toggleClass(player.elements.container, player.config.classes.hideControls, true);
            }, delay);
        }

        // Allow chaining
        return player;
    };

    // Event listeners
    Plyr.prototype.on = function(event, callback) {
        var player = this;

        // Listen for events on container
        utils.on(player.elements.container, event, callback);

        // Allow chaining
        return player;
    };

    Plyr.prototype.off = function(event, callback) {
        var player = this;

        // Listen for events on container
        utils.off(player.elements.container, event, callback);

        // Allow chaining
        return player;
    };

    // Check for support
    Plyr.prototype.supports = function(mimeType) {
        return support.mime(this, mimeType);
    };

    // Destroy an instance
    // Event listeners are removed when elements are removed
    // http://stackoverflow.com/questions/12528049/if-a-dom-element-is-removed-are-its-listeners-also-removed-from-memory
    Plyr.prototype.destroy = function(callback, restore) {
        var player = this;

        // Type specific stuff
        switch (player.type) {
            case 'youtube':
                // Clear timers
                window.clearInterval(player.core.timers.buffering);
                window.clearInterval(player.core.timers.playing);

                // Destroy YouTube API
                player.embed.destroy();

                // Clean up
                done();

                break;

            case 'vimeo':
                // Destroy Vimeo API
                // then clean up (wait, to prevent postmessage errors)
                player.embed.unload().then(done);

                // Vimeo does not always return
                window.setTimeout(done, 200);

                break;

            case 'video':
            case 'audio':
                // Restore native video controls
                player.core.toggleNativeControls(true);

                // Clean up
                done();

                break;
        }

        function done() {
            // Bail if already destroyed
            if (player === null) {
                return;
            }

            // Default to restore original element
            if (!utils.is.boolean(restore)) {
                restore = true;
            }

            // Reset overflow (incase destroyed while in fullscreen)
            document.body.style.overflow = '';

            // Replace the container with the original element provided
            if (restore) {
                var parent = player.elements.container.parentNode;

                if (utils.is.htmlElement(parent)) {
                    parent.replaceChild(player.elements.original, player.elements.container);
                }
            }

            // Event
            player.core.trigger(player.elements.original, 'destroyed', true);

            // Callback
            if (utils.is.function(callback)) {
                callback.call(player.elements.original);
            }

            // Allow chaining
            player = null;
        }
    };

    // Get the duration (or custom if set)
    Plyr.prototype.getDuration = function() {
        var player = this;

        // It should be a number, but parse it just incase
        var duration = parseInt(player.config.duration);

        // True duration
        var mediaDuration = 0;

        // Only if duration available
        if (player.media.duration !== null && !isNaN(player.media.duration)) {
            mediaDuration = player.media.duration;
        }

        // If custom duration is funky, use regular duration
        return (isNaN(duration) ? mediaDuration : duration);
    };

    return Plyr;
});