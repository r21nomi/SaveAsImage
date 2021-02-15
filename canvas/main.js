const onSaveAsImage = (canvasId) => {
    console.log("onSave");

    let c = document.getElementById(canvasId);
    let i = c.toDataURL("image/jpeg");

    const dataURItoBlob = (dataURI) => {
        // convert base64 to raw binary data held in a string
        const byteString = atob(dataURI.split(",")[1]);

        // separate out the mime component
        const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

        // write the bytes of the string to an ArrayBuffer
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const _ia = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            _ia[i] = byteString.charCodeAt(i);
        }

        const dataView = new DataView(arrayBuffer);

        return new Blob([dataView], {type: mimeString});
    };

    const blob = dataURItoBlob(i);
    window.open(window.URL.createObjectURL(blob));
};
