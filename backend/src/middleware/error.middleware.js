const errorHandler = (error, req, res, next) => {

    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "Image exceeds the 5MB limit."
        });
    }

    if (error.name === "MulterError") {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    if (error.message && error.message.includes("Only JPG")) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    res.status(error.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === "production"
            ? "Something went wrong."
            : error.message
    });

};

module.exports = errorHandler;
