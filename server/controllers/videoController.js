let currentVideoState = {
    action: 'pause',
    currentTime: 0,
    videoSrc: ''
};

const updateVideoControl = (data) => {
    currentVideoState = {
        action: data.action,
        currentTime: data.currentTime,
        videoSrc: currentVideoState.videoSrc // Keep the video source unchanged
    };
    return currentVideoState;
};

const updateVideoSource = (videoSrc) => {
    currentVideoState.videoSrc = videoSrc;
    return currentVideoState;
};

module.exports = { updateVideoControl, updateVideoSource, currentVideoState };
