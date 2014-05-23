/**
 * TTYREC player
 * @constructor
 * @param {object} term - Terminal to write TTY output to
 * @param {object} opts - config object with optional parameters
 *    url - url of a TTYREC file or gzipped TTYREC file
 *    pause - true to pause playback when loading a URL
 *    speed - speed multiplier.  (i.e. speed=2 means to play twice as fast)
 *    max_frame - cap the playback delay for a frame in milliseconds
 *    err - function for callback for errors.
 *  
 * Depends upon an external TERM (i.e. https://github.com/chjj/term.js/)
 * Optionally decompresses gzipped TTY rec files using pako.
 * Optionally asynchronously loads an initial url, if jBinary package is loaded
 *
 * Usage:
 *   TTYPlay
 */ 
var TTYPlay = function (term, opts) {
    if (!term) throw "Must supply term.js terminal to TTYPlay";
    opts = opts || {};

    var data = null;
    var frames = null;
    var timeout = null;
    var index = 0;
    var speed = opts.speed || 1;
    var max_frame = opts.max_frame || 1000;

    function parse(res) {
        data = new DataView(res);
        frames = [];

        // detect GZIP compression & transparently deflate
        if (data.getUint16(0,false)==0x1f8b) {
            if (!pako) throw "Must have GZIP library to handle GZIPPED tty recordings";

            res = pako.inflate(new Uint8Array(res)).buffer;
            data = new DataView(res);
        }

        var offset = 0;
        var size = data.byteLength;

        while (offset < size) {
            var sec = data.getUint32(offset, true);
            offset += 4;
            var usec = data.getUint32(offset, true);
            offset += 4;
            var length = data.getUint32(offset, true);
            offset += 4;

            frames.push({
                time: sec*1000 + usec/1000,
                start: offset,
                length: length
            });

            offset += length;
        }
    }

    function step() {
        var current = frames[index];
        if (!current) return;

        // convert frame data to string & write to terminal
        var str = String.fromCharCode.apply(null, new Uint8Array(data.buffer, current.start, current.length));
        term.write(str);

        index++;
    }

    function play() {
        // show a frame
        step();

        var current = frames[index-1];
        var next = frames[index];
        if (next) {
            // handle delay to next frame
            var delay = next.time - current.time;
            delay = delay/speed;
            delay = delay>max_frame? max_frame : delay;
            timeout = window.setTimeout(play, delay);
        }
    };

    function stop() {
        // stop playback
        window.clearTimeout(timeout);
    }

    if (opts.url) {
        jBinary.loadData(opts.url, function(err, data) {
            if (err) {
                if (opts.err) {
                    opts.err(err);
                    return;
                }
                alert("Couldn't open TTY file: "+opts.url);
                throw err;
            }
            parse(data);
            if (!opts.pause) play();
        });
    }

    return {
        parse: parse,
        play: play,
        step: step,
        stop: stop
    };
};