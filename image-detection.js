// Notice there is no 'import' statement. 'cocoSsd' and 'tf' is
// available on the index-page because of the script tag above.
var tfModel = undefined

cropToCanvas = (image, canvas, ctx) => {
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    canvas.width = image.width;
    canvas.height = image.height;

    console.log(image.width);
    console.log(image.height);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (naturalWidth > naturalHeight) {
    ctx.drawImage(
        image,
        (naturalWidth - naturalHeight) / 2,
        0,
        naturalHeight,
        naturalHeight,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
    );
    } else {
    ctx.drawImage(
        image,
        0,
        (naturalHeight - naturalWidth) / 2,
        naturalWidth,
        naturalWidth,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
    );
    }
};

labelImage = (model, c) => {
    // detect objects in the image.
    const ctx = c.getContext("2d");

    model.detect(c).then(predictions => {
        console.log('Predictions: ', predictions);

        // Font options.
        const font = "16px sans-serif";
        ctx.font = font;
        ctx.textBaseline = "top";

        predictions.forEach(prediction => {
            const x = prediction.bbox[0];
            const y = prediction.bbox[1];
            const width = prediction.bbox[2];
            const height = prediction.bbox[3];
            // Draw the bounding box.
            ctx.strokeStyle = "#00FFFF";
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, width, height);
            // Draw the label background.
            ctx.fillStyle = "#00FFFF";
            const textWidth = ctx.measureText(prediction.class).width;
            const textHeight = parseInt(font, 10); // base 10
            ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
        });

        predictions.forEach(prediction => {
            const x = prediction.bbox[0];
            const y = prediction.bbox[1];
            // Draw the text last to ensure it's on top.
            ctx.fillStyle = "#000000";
            ctx.fillText(prediction.class, x, y);
        });
    });
};

class FakeModel {

    async detect(c) {
        return [
            {
                "bbox": [
                    60.0,
                    10.0,
                    200.0,
                    250.0
                ],
                "class": "Software Engineer",
                "score": 0.999
            },
            {
                "bbox": [
                    80.0,
                    20.0,
                    200.0,
                    250.0
                ],
                "class": "Data Engineer",
                "score": 0.999
            },
            {
                "bbox": [
                    100.0,
                    30.0,
                    200.0,
                    250.0
                ],
                "class": "Data Scientist",
                "score": 0.999
            }
        ]
    }

}

drawImage = (src, canvas_id, label = true) => {
    var img = new Image();
    console.log(src)
    if(src.startsWith("https://")) {
        img.crossOrigin = "Anonymous";  // Sneaky: This enables CORS
    } else {
        //img.crossOrigin = "Anonymous";  // Sneaky: This enables CORS
    }
    img.src = src    
    img.onload = function(){
        console.log(this.width);
        const c = document.getElementById(canvas_id);
        const ctx = c.getContext("2d");
        ctx.drawImage(this, 100, 100);
        cropToCanvas(this, c, ctx);
        console.log("Image drawn.")
        console.log(label)
        if(label) {
            imageDetection(canvas_id)
        }        
    }    
}

imageDetection = (canvas_id) => {
    const c = document.getElementById(canvas_id)
    if(canvas_id == "jurgis") {
        const fakeModel = new FakeModel()
        labelImage(fakeModel, c)        
    } else {
        if(tfModel === undefined) {
            console.log("Loading TensorFlow model...")
            $("#modelLoading").collapse('show')
            cocoSsd.load().then(model => {
                tfModel = model
                console.log("Loaded model.")
                $("#modelLoading").collapse('hide')
                labelImage(model, c)
            });
        } else {
            $("#modelLoading").collapse('hide')
            console.log("TensorFlow model already loaded.")
            labelImage(tfModel, c)
        }

    }
}



detectCustomImage = () => {
    image_url = document.getElementById("image-url")
    image_url.value = image_url.value.replace('http://','https://')
    src = image_url.value
    console.log(src)
    drawImage(src, "canvas", label = true);
};

drawImage("Jurgis_blau.jpg", "jurgis", label = false)
drawImage("https://farm1.staticflickr.com/8/12283150_12d37e6389_z.jpg", "canvas", label = true)
$("#modelLoading").collapse('hide')

