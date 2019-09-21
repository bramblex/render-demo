const render = (function () {

    const ctx = document.getElementById('output-canvas').getContext('2d')

    function simplifyDom(doms) {
        return doms.filter(({ type }) => type === 'tag').map(dom => ({
            className: dom.attributes['class'],
            children: dom.children ? simplifyDom(dom.children) : undefined,
            scrollTop: 0
        }))
    }

    function simplifySheet(sheet) {
        const style = {}
        for (const rule of sheet.cssRules) {
            const className = rule.mSelectorText.replace('.', '')
            style[className] = {}
            for (const { property, values: [{ value }] } of rule.declarations) {
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
        const handler = new Tautologistics.NodeHtmlParser.HtmlBuilder(function (error) {
            if (error) {
                console.error(error)
            }
        })
        const parser = new Tautologistics.NodeHtmlParser.Parser(handler)
        parser.parseComplete(html)
        return simplifyDom(handler.dom)
    }

    function parseStyle(style) {
        var parser = new CSSParser();
        var sheet = parser.parse(style, false, true);
        return simplifySheet(sheet)
    }

    function renderDoms(doms, direction = 'vertical', _offsetX = 0, _offsetY = 0) {
        if (!doms) {
            return
        }

        let offsetX = _offsetX
        let offsetY = _offsetY

        for (const dom of doms) {
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
        if (!doms) return
        for (const dom of doms) {
            dom.style = {
                direction: 'vertical',
                color: 'transparent',
                ...style[dom.className]
            }

            const children = mergeStyle(dom.children, style)

            if (!children) {
                continue
            }

            if (typeof dom.style.height === 'undefined') {
                const childrenHasHeight = children.filter(child => typeof child.style.height === 'number')
                if (childrenHasHeight.length > 0) {
                    dom.style.height
                        = dom.style.direction === 'horizontal'
                            ? Math.max(...childrenHasHeight.map(child => (child.style.height)))
                            : childrenHasHeight.reduce((sum, child) => sum + child.style.height, 0)
                }
            }

            if (typeof dom.style.width === 'undefined') {
                const childrenHasWidth = children.filter(child => typeof child.style.width === 'number')
                if (childrenHasWidth.length > 0) {
                    dom.style.width
                        = dom.style.direction === 'horizontal'
                            ? childrenHasWidth.reduce((sum, child) => sum + child.style.width, 0)
                            : Math.max(...childrenHasWidth.map(child => child.style.width))
                }
            }
        }
        return doms
    }

    return function render(html, css) {
        const doms = mergeStyle(parseHtml(html), parseStyle(css))
        renderDoms(doms)
    }

})()
