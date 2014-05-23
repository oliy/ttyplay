ttyplay
=======

Pure HTML5 TTY Recording player.

This Javascript class allows you to embed TTY recordings on your own pages without
having to resort to converting the recording to a movie (i.e. large file).  This means
you can just store your TTY or gzipped TTY files on the web and use this class as
a viewer for the recordings.

This uses term.js, pako, and jBinary for the decoding/viewing, but packages it into
a simple class.

Usage:

After you include the following dependencies:

    <!-- Term JS, required -->
    <script type="text/javascript" src="js/term.js"></script>

    <!-- jBinary, if you want this to handle your async loading of TTY files -->
    <script type="text/javascript" src="js/jbinary.js"></script>

    <!-- pako, optional, if you want to use GZIP TTY files -->
    <script type="text/javascript" src="js/pako.js"></script>

    <!-- The TTY Player itself, required -->
    <script type="text/javascript" src="js/ttyplay.js"></script>


To use the player, after loading create the terminal:

    <!-- see Term JS documentation for additional configuration -->
    var term = new Terminal({
            cols: 80,
            rows: 24
    });
    term.open(document.body);

Then instantiate a player:

    var player = new TTYPlay(term, { url: 'test.tty.gz', speed:5, max_frame:500 });

This will automatically load the file and start playing the content at 5x speed,
with a maximum frame deplay of 500ms.
