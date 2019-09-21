var render = (function () {

    var ctx = document.getElementById('output-canvas').getContext('2d')

    function simplifyDom(doms) {
        return doms.filter(function (ref) {
            var type = ref.type;

            return type === 'tag';
        }).map(function (dom) { return ({
            className: dom.attributes['class'],
            children: dom.children ? simplifyDom(dom.children) : undefined,
            scrollTop: 0
        }); })
    }

    function simplifySheet(sheet) {
        var style = {}
        for (var i$1 = 0, list$1 = sheet.cssRules; i$1 < list$1.length; i$1 += 1) {
            var rule = list$1[i$1];

            var className = rule.mSelectorText.replace('.', '')
            style[className] = {}
            for (var i = 0, list = rule.declarations; i < list.length; i += 1) {
                var ref = list[i];
                var property = ref.property;
                var value = ref.values[0].value;

                if (property === 'width' || property === 'height') {
                    style[className][property] = parseFloat(value)
                } else {
                    style[className][property] = value
                }
            }
        }
        return style
    }

    function parseHtml(html) {
        var handler = new Tautologistics.NodeHtmlParser.HtmlBuilder(function (error) {
            if (error) {
                console.error(error)
            }
        })
        var parser = new Tautologistics.NodeHtmlParser.Parser(handler)
        parser.parseComplete(html)
        return simplifyDom(handler.dom)
    }

    function parseStyle(style) {
        var parser = new CSSParser();
        var sheet = parser.parse(style, false, true);
        return simplifySheet(sheet)
    }

    function renderDoms(doms, direction, _offsetX, _offsetY) {
        if ( direction === void 0 ) direction = 'vertical';
        if ( _offsetX === void 0 ) _offsetX = 0;
        if ( _offsetY === void 0 ) _offsetY = 0;

        if (!doms) {
            return
        }

        var offsetX = _offsetX
        var offsetY = _offsetY

        for (var i = 0, list = doms; i < list.length; i += 1) {
            var dom = list[i];

            ctx.fillStyle = dom.style.color;
            ctx.fillRect(offsetX, offsetY, dom.style.width, dom.style.height)
            renderDoms(dom.children, dom.style.direction, offsetX, offsetY, dom.scrollTop)

            if (direction === 'horizontal') {
                offsetX += dom.style.width
            } else {
                offsetY += dom.style.height
            }
        }
    }

    function mergeStyle(doms, style) {
        if (!doms) { return }
        for (var i = 0, list = doms; i < list.length; i += 1) {
            var dom = list[i];

            dom.style = Object.assign({}, {direction: 'vertical',
                color: 'transparent'},
                style[dom.className])

            var children = mergeStyle(dom.children, style)

            if (!children) {
                continue
            }

            if (typeof dom.style.height === 'undefined') {
                var childrenHasHeight = children.filter(function (child) { return typeof child.style.height === 'number'; })
                if (childrenHasHeight.length > 0) {
                    dom.style.height
                        = dom.style.direction === 'horizontal'
                            ? Math.max.apply(Math, childrenHasHeight.map(function (child) { return (child.style.height); }))
                            : childrenHasHeight.reduce(function (sum, child) { return sum + child.style.height; }, 0)
                }
            }

            if (typeof dom.style.width === 'undefined') {
                var childrenHasWidth = children.filter(function (child) { return typeof child.style.width === 'number'; })
                if (childrenHasWidth.length > 0) {
                    dom.style.width
                        = dom.style.direction === 'horizontal'
                            ? childrenHasWidth.reduce(function (sum, child) { return sum + child.style.width; }, 0)
                            : Math.max.apply(Math, childrenHasWidth.map(function (child) { return child.style.width; }))
                }
            }
        }
        return doms
    }

    return function render(html, css) {
        var doms = mergeStyle(parseHtml(html), parseStyle(css))
        renderDoms(doms)
    }

})()

