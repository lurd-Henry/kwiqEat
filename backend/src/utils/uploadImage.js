const cloudinary = require("../config/cloudinary");

const uploadImage = (fileBuffer, folder = "kwiqeat/food") => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image"
            },
            (error, result) => {

                if (error) {
                    return reject(error);
                }

                resolve({
                    url: result.secure_url,
                    public_id: result.public_id
                });

            }
        );

        stream.end(fileBuffer);

    });

};

module.exports = uploadImage;
