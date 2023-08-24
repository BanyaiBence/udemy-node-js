// The way of importing dependencies is using the "require" function
const http = require("http");
const fs = require("fs");

// Request listener
function rqListener(req, res){
    //console.log(req.url, req.method, req.headers);
    // Let's generate a response based on the request
    const url = req.url;
    const method = req.method;
    if (url === "/"){
        // res will be used to fill it with data
        
        // We write some html data into the response line-by-line
        res.write("<html>");
        res.write("<head><title>Enter Message</title></head>");
        // The POST method will automatically put the form data into the request it sends to our server
        res.write('<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></form></body>');
        res.write("</html>");
        // We tell, that we're done with the response
        return res.end();
        // If we try to modify the response after this point, we'd get an error, because it's already sent. This is why we return instead
    }
    if (url === "/message" && method ==="POST"){
        const body = []; // We will be editing the object, but never reassigning it, so as long as the reference stays the same, having a constant variable is fine
        // We create an event listener
        // Will be fired when a new chunk of data is ready to be read from the buffer
        req.on('data', (chunk) => {
            //console.log(chunk);
            body.push(chunk);
        }); 
        // Will be run when we are done parsing the data from the stream
        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString(); // To string is only fine here because we know the incoming data will be text
            //console.log(parsedBody);
            const message = parsedBody.split("=")[1];
            // We write some data into a file on the server
            // This is a blocking code, it will be executed before the response is sent
            // Nothing else will happen until this is done, which is not good for a server
            //fs.writeFileSync("message.txt", message);
            // This is a non-blocking code, it will be executed after the response is sent
            // We pass a callback function, which will be executed when the file is written and handle if and error occured
            fs.writeFile("message.txt", message, err => {
                // The 302 status code stand for redirection
                res.statusCode = 302;
                res.setHeader("Location", "/");
                return res.end();
            });
        });
    } 
    // We tell that the type of our content is text/html
    // A more detailed article about headers: 
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>My First Page</title></head>");
    res.write('<body><h1>Hello from my Node.js Server!</h1></body>');
    res.write("</html>");
    res.end();
    // It will exit after the first incomig request, the event loop is closed
    //process.exit();
}

// The rqListener will be run for evey request that reaches out to our server
const server = http.createServer(rqListener);

// Node.js won't exit our script, but keep the script running to listen for incoming requests
server.listen(3000);

// This is already a somewhat functional web server

