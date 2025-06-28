import React, { useEffect, useState } from "react";

const SecureVideoPlayer = ({ videoId }) => {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    const fetchBlobVideo = async () => {
      const res = await fetch(`/api/video/${videoId}`, {
        headers: { Range: "bytes=0-" },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    };

    fetchBlobVideo();
  }, [videoId]);

  return blobUrl ? (
    <video
      src={blobUrl}
      controls
      controlsList="nodownload"
      onContextMenu={(e) => e.preventDefault()}
      className="rounded-lg w-full"
    />
  ) : (
    <p className="text-white">Loading video...</p>
  );
};

export default SecureVideoPlayer;
