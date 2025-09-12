// @ts-check

/**
 * @typedef {Record<string, any>} RfqItemsDict
 * @typedef {{ [category: string]: string[] }} RecipientsByCategory
 */

/**
 * Build the POST body the API expects.
 * @param {RfqItemsDict} lineItemsFromServer - raw “line-items” dict as delivered by your API
 * @param {RecipientsByCategory} recipientsByCategory - edited recipients grouped by category
 * @param {boolean} dryRun
 */
export function buildSendBody(lineItemsFromServer, recipientsByCategory, dryRun = true) {
    // Ensure item keys are strings and pass through fields unmodified.
    const rfqItems = {};
    for (const [itemId, item] of Object.entries(lineItemsFromServer || {})) {
        rfqItems[String(itemId)] = { ...item };
    }

    return {
        rfqItems,
        recipientsByCategory: recipientsByCategory || {},
        dryRun: !!dryRun,
    };
}

