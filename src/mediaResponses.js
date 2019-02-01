const fs = require("fs");
const path = require("path");

const loadFile = (request, response, file, contentType) => {
  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        response.writeHead(404);
      }
      return response.end(err);
    }

    let { range } = request.headers;

    if (!range) {
      range = "bytes=0-";
    }

    // grab the strign and replace the bytes= to get the beg/end pos
    const positions = range.replace(/bytes=/, "").split("-");

    let start = parseInt(positions[0], 10);

    // total file size
    const total = stats.size;
    // check for end
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    if (start > end) {
      start = end - 1;
    }

    // determine how big of a chunk to send back to browser
    const chunksize = end - start + 1;

    /* send back partial content 206 tells browser it can
    request other ranges but hasnt recieved the entire file */
    response.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${total}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": contentType
    });

    const stream = fs.createReadStream(file, { start, end });

    stream.on("open", () => {
      // as one byte is read in it is written to client keeping it lightweight
      stream.pipe(response);
    });

    // rtrn stream error
    stream.on("error", streamErr => {
      response.end(streamErr);
    });

    return stream;
  });
};

const getParty = (request, response) => {
  const file = path.resolve(__dirname, "../client/party.mp4");
  loadFile(request, response, file, "video/mp4");
};

const getBling = (request, response) => {
  const file = path.resolve(__dirname, "../client/bling.mp3");
  loadFile(request, response, file, "audio/mpeg");
};

const getBird = (request, response) => {
  const file = path.resolve(__dirname, "../client/bird.mp4");
  loadFile(request, response, file, "video/mp4");
};

module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;
