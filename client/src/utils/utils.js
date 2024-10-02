export const removeDuplicates = (arr) => {
    return [...new Set(arr)];
};

export const sortClipsViewCount = (clips_arr) => {
    clips_arr.sort( function(a,b){ return b.view_count - a.view_count; } );
}

export function timeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const secondsAgo = Math.floor((now - past) / 1000);

    if (secondsAgo < 60) {
        return `${secondsAgo} seconds ago`;
    }

    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) {
    return `${minutesAgo} minutes ago`;
    }

    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) {
        return `${hoursAgo} hours ago`;
    }

    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo < 30) {
        return `${daysAgo} days ago`;
    }

    const monthsAgo = Math.floor(daysAgo / 30);
    if (monthsAgo < 12) {
        return `${monthsAgo} months ago`;
    }

    const yearsAgo = Math.floor(monthsAgo / 12);
    return `${yearsAgo} years ago`;
}