
document.getElementById('render').addEventListener('click', function () {
    document.getElementById('output-canvas').getContext('2d').
        clearRect(0, 0, 1000, 1000);
    render(
        document.getElementById('input-html').value,
        document.getElementById('input-css').value
    )
})
