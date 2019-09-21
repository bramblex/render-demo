
document.getElementById('render').addEventListener('click', function () {
    document.getElementById('output-canvas').getContext('2d').clear()
    render(
        document.getElementById('input-html').value,
        document.getElementById('input-css').value
    )
})
