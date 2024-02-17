const artLinks = document.querySelectorAll('.showArtLink');

artLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();

        const iframeSrc = this.getAttribute('href');
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.src = iframeSrc;

        // Append the iframe to the body
        document.body.appendChild(iframe);

        // Function to handle fullscreen changes
        function onFullscreenChange() {
            if (!document.fullscreenElement) {
                // If not in fullscreen, remove the iframe and the event listener
                iframe.remove();
                document.removeEventListener('fullscreenchange', onFullscreenChange);
            }
        }

        // Listen for fullscreen change events
        document.addEventListener('fullscreenchange', onFullscreenChange, false);

        // Request fullscreen for the iframe
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        }
    });
});
