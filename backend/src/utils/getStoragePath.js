// To get storage part from url of image

const getStoragePathFromUrl = async (url) => {
    const match = url.match(/\/o\/([^?]+)/);
    if (!match || !match[1]) return null;
    return decodeURIComponent(match[1]);
}

export { getStoragePathFromUrl };