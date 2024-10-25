<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <h1>Face Recognition API</h1>
    <p>This API allows you to detect and recognize faces using the <a href="https://github.com/justadudewhohacks/face-api.js">face-api.js</a> library. The API processes uploaded images to detect faces, extract facial landmarks, and compare them with known faces for identification.</p>
    <h2>Key Features</h2>
    <ul>
        <li>Facial detection using the <code>MtcnnOptions</code> model.</li>
        <li>Landmark detection for facial features.</li>
        <li>Face recognition using pre-trained models loaded from disk.</li>
        <li>Integration with <a href="https://github.com/oliver-moran/jimp">Jimp</a> for image resizing and buffer management.</li>
        <li>API response includes matched faces and confidence levels.</li>
    </ul>
    <h2>Setup</h2>
    <pre><code>
    git clone https://github.com/your-repo/face-recognition-api.git
    cd face-recognition-api
    npm install
    </code></pre>
    <h2>Usage</h2>
    <p>To start the API, first load the models and initialize the Express server:</p>
    <pre><code>
    npm run start
    </code></pre>
    <h3>Endpoints</h3>
    <ul>
        <li><code>POST /detectFace</code>: Upload an image file to detect faces in the image and return matching results.</li>
    </ul>
    <h3>Sample Request</h3>
    <p>To test the face detection, send a POST request to the <code>/detectFace</code> endpoint with a form-data parameter <code>image</code>:</p>
    <pre><code>
    curl -X POST http://localhost:3000/detectFace
    -F "image=@/path/to/your/image.jpg"
    </code></pre>
    <h3>API Response</h3>
    <p>If a face is detected and matched, the API will return a JSON response with the matched face code:</p>
    <pre><code>
    {
      "codigo": "matched_face_code"
    }
    </code></pre>
    <h3>Dependencies</h3>
    <ul>
        <li><code>face-api.js</code> - Facial recognition library</li>
        <li><code>express</code> - Web framework for Node.js</li>
        <li><code>jimp</code> - Image processing</li>
        <li><code>multer</code> - Middleware for handling file uploads</li>
        <li><code>pm2</code> - Process manager for running the server</li>
    </ul>
    <h2>How It Works</h2>
    <ol>
        <li>Models for face detection, landmarks, and recognition are loaded from disk.</li>
        <li>An image is uploaded via a POST request to the <code>/detectFace</code> endpoint.</li>
        <li>The image is resized using <code>Jimp</code> to optimize the face detection process.</li>
        <li>Using the <code>MtcnnOptions</code> from <code>face-api.js</code>, the system detects all faces in the image and extracts descriptors.</li>
        <li>The API compares these descriptors against a labeled dataset and returns the closest match.</li>
        <li>The result, including the best match or an error message, is sent back to the client in JSON format.</li>
    </ol>
    <h2>Error Handling</h2>
    <p>If no faces are detected, or if an error occurs, the API returns appropriate error messages:</p>
    <pre><code>
    {
      "message": "No faces detected"
    }
    </code></pre>
    <h2>License</h2>
    <p>This project is licensed under the MIT License.</p>
</body>
</html>
