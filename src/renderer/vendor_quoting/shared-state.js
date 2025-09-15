// @ts-check

// Keep a reference to the last loaded server data (so React and modal components can share it)
export const SharedModalState = {
    /** raw dict from server: data["line-items"] */
    currentLineItems: null,
    /** optional RFQ id for your URL path */
    currentRfqId: null,
};
