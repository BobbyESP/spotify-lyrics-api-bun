export function formatLineTimestamp(startTimeMs: number): string { // Define the utility function to format timestamps
    const minutes = Math.floor(startTimeMs / 60000);
    const seconds = Math.floor((startTimeMs % 60000) / 1000);
    const milliseconds = startTimeMs % 1000;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}
