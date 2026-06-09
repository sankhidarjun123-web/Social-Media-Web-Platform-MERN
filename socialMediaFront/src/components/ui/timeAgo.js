// Helper function calculates the time of upload of the post
function timeAgo(createdAt) {
    const now = new Date();
    const past = new Date(createdAt);
    const diff = (now - past) / 1000; // seconds

    if (diff < 60) return `${Math.floor(diff)} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;

    return past.toLocaleDateString();
}

export default timeAgo;